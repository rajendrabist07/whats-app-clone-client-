import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getMessages, sendMessage } from '../../api/message.api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export const ChatWindow = ({ chat }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const title = useMemo(() => {
    if (!chat) return '';
    if (chat.isGroupChat) return chat.chatName;
    return chat.participants?.find((participant) => participant._id !== user?._id)?.username || 'Chat';
  }, [chat, user]);

  useEffect(() => {
    if (!chat?._id) return;
    setLoading(true);
    getMessages(chat._id)
      .then(({ data }) => setMessages(data.data.messages))
      .finally(() => setLoading(false));
    socket?.emit('join_chat', chat._id);
  }, [chat?._id, socket]);

  useEffect(() => {
    if (!socket || !chat?._id) return undefined;

    const handleNewMessage = (message) => {
      if (message.chat === chat._id || message.chat?._id === chat._id) {
        setMessages((prev) => (prev.some((item) => item._id === message._id) ? prev : [...prev, message]));
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket, chat?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !chat?._id || sending) return;

    setSending(true);
    try {
      const { data } = await sendMessage(chat._id, content);
      setDraft('');
      setMessages((prev) => (prev.some((item) => item._id === data.data._id) ? prev : [...prev, data.data]));
    } finally {
      setSending(false);
    }
  };

  if (!chat) {
    return (
      <section className="chat-empty">
        <h2>Select a chat</h2>
        <p>Search for a user and start a conversation.</p>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <div>
          <h2>{title}</h2>
          <span>{chat.isGroupChat ? `${chat.participants?.length || 0} members` : 'Direct message'}</span>
        </div>
      </header>

      <div className="messages">
        {loading && <p className="muted">Loading messages...</p>}
        {!loading && messages.length === 0 && <p className="muted">No messages yet.</p>}
        {messages.map((message) => {
          const mine = message.sender?._id === user?._id || message.sender === user?._id;
          return (
            <div className={`message-row ${mine ? 'mine' : ''}`} key={message._id}>
              <div className="message-bubble">
                {!mine && <strong>{message.sender?.username || 'User'}</strong>}
                <p>{message.content}</p>
                <span>{message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : ''}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message" />
        <button className="primary-btn" disabled={sending} type="submit">{sending ? 'Sending' : 'Send'}</button>
      </form>
    </section>
  );
};
