import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);
  // Expose a state counter so consumers can re-run effects when socket connects
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    if (!user) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setSocketReady(true));
    socket.on('disconnect', () => setSocketReady(false));

    // If already connected synchronously (e.g. reconnect) mark ready immediately
    if (socket.connected) setSocketReady(true);

    return () => {
      socket.disconnect();
      setSocketReady(false);
    };
  }, [user]);

  return { socketRef, socketReady };
}
