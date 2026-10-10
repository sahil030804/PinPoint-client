import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useWebSocket() {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    const token = localStorage.getItem('pp_token');
    const socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      auth: { token },
    });

    socket.on('connect', () => {
      for (const [event, cb] of listenersRef.current.entries()) {
        socket.off(event, cb);
        socket.on(event, cb);
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const joinFeedback = useCallback((feedbackId) => {
    socketRef.current?.emit('join:feedback', feedbackId);
  }, []);

  const leaveFeedback = useCallback((feedbackId) => {
    socketRef.current?.emit('leave:feedback', feedbackId);
  }, []);

  const onActivity = useCallback((callback) => {
    listenersRef.current.set('activity:new', callback);
    socketRef.current?.on('activity:new', callback);
    return () => {
      listenersRef.current.delete('activity:new');
      socketRef.current?.off('activity:new', callback);
    };
  }, []);

  return { joinFeedback, leaveFeedback, onActivity, socket: socketRef.current };
}
