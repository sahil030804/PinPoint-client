import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useWebSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinFeedback = useCallback((feedbackId) => {
    socketRef.current?.emit('join:feedback', feedbackId);
  }, []);

  const leaveFeedback = useCallback((feedbackId) => {
    socketRef.current?.emit('leave:feedback', feedbackId);
  }, []);

  const onActivity = useCallback((callback) => {
    socketRef.current?.on('activity:new', callback);
    return () => socketRef.current?.off('activity:new', callback);
  }, []);

  return { joinFeedback, leaveFeedback, onActivity, socket: socketRef.current };
}
