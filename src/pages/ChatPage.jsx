import { useEffect, useMemo, useState } from 'react';
import { getChats, searchUsers, startChat } from '../api/chat.api';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useDebounce } from '../hooks/useDebounce';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { chats, activeChat, dispatch } = useChat();
  const { isConnected } = useSocket();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    getChats()
      .then(({ data }) => dispatch({ type: 'SET_CHATS', payload: data.data }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load chats'));
  }, [dispatch]);

  useEffect(() => {
    searchUsers(debouncedQuery)
      .then(({ data }) => setUsers(data.data))
      .catch(() => setUsers([]));
  }, [debouncedQuery]);

  const sortedChats = useMemo(() => [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), [chats]);

  const chatTitle = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    return chat.participants?.find((participant) => participant._id !== user._id)?.username || 'Chat';
  };

  const handleStartChat = async (userId) => {
    const { data } = await startChat(userId);
    dispatch({ type: 'UPSERT_CHAT', payload: data.data });
    setQuery('');
    setUsers([]);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="sidebar-header">
          <div>
            <h1>Chats</h1>
            <span className={isConnected ? 'status online' : 'status'}>{isConnected ? 'Online' : 'Offline'}</span>
          </div>
          <button className="ghost-btn" onClick={logout}>Logout</button>
        </header>

        <div className="profile-line">
          <span className="avatar">{user.username?.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" />
        {error && <div className="error-banner">{error}</div>}

        {query && (
          <div className="list-section">
            <h2>Users</h2>
            {users.map((item) => (
              <button className="list-row" key={item._id} onClick={() => handleStartChat(item._id)}>
                <span className="avatar">{item.username.slice(0, 1).toUpperCase()}</span>
                <span>{item.username}</span>
              </button>
            ))}
            {users.length === 0 && <p className="muted small">No users found.</p>}
          </div>
        )}

        <div className="list-section">
          <h2>Recent</h2>
          {sortedChats.map((chat) => (
            <button
              className={`list-row ${activeChat?._id === chat._id ? 'selected' : ''}`}
              key={chat._id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat })}
            >
              <span className="avatar">{chatTitle(chat).slice(0, 1).toUpperCase()}</span>
              <span>{chatTitle(chat)}</span>
            </button>
          ))}
          {sortedChats.length === 0 && <p className="muted small">No chats yet.</p>}
        </div>
      </aside>

      <ChatWindow chat={activeChat} />
    </main>
  );
}
