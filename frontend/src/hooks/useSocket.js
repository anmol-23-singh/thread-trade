import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef;
}
