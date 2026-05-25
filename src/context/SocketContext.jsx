import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const nextSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('accessToken') },
      withCredentials: true,
    });

    nextSocket.on('connect', () => setIsConnected(true));
    nextSocket.on('disconnect', () => setIsConnected(false));
    nextSocket.on('connect_error', (err) => console.error('Socket connection error:', err.message));
    setSocket(nextSocket);

    return () => nextSocket.disconnect();
  }, [user]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
