// src/hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  // Connect to Socket.IO server
  const connect = useCallback(() => {
    if (!token) {
      setConnectionError('No authentication token provided');
      return;
    }

    try {
      const socketInstance = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000, // 10 seconds timeout
        autoConnect: false // Don't auto connect
      });

      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server:', socketInstance.id);
        setIsConnected(true);
        setConnectionError(null);
        setSocket(socketInstance);
        socketRef.current = socketInstance;
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.IO server:', reason);
        setIsConnected(false);
        socketRef.current = null;
        setSocket(null);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        socketRef.current = null;
        setSocket(null);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Now connect
      socketInstance.connect();
    } catch (error) {
      setConnectionError(error.message);
      console.error('Socket connection error:', error);
    }
  }, [token]);

  // Disconnect from Socket.IO server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  // Join session room
  const joinSession = useCallback((sessionId) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('join-session', sessionId);
    }
  }, []);

  // Leave session room
  const leaveSession = useCallback((sessionId) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit('leave-session', sessionId);
    }
  }, []);

  // Send WebRTC offer
  const sendOffer = useCallback((data) => {
    if (socketRef.current) {
      socketRef.current.emit('webrtc-offer', data);
    }
  }, []);

  // Send WebRTC answer
  const sendAnswer = useCallback((data) => {
    if (socketRef.current) {
      socketRef.current.emit('webrtc-answer', data);
    }
  }, []);

  // Send WebRTC ICE candidate
  const sendIceCandidate = useCallback((data) => {
    if (socketRef.current) {
      socketRef.current.emit('webrtc-ice-candidate', data);
    }
  }, []);

  // Listen for WebRTC offer
  const onOffer = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('webrtc-offer', callback);
    }
  }, []);

  // Listen for WebRTC answer
  const onAnswer = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('webrtc-answer', callback);
    }
  }, []);

  // Listen for WebRTC ICE candidate
  const onIceCandidate = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('webrtc-ice-candidate', callback);
    }
  }, []);

  // Listen for user joined
  const onUserJoined = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-joined', callback);
    }
  }, []);

  // Listen for user left
  const onUserLeft = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-left', callback);
    }
  }, []);

  // Listen for session started
  const onSessionStarted = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('session-started', callback);
    }
  }, []);

  // Listen for session ended
  const onSessionEnded = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('session-ended', callback);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    onOffer,
    onAnswer,
    onIceCandidate,
    onUserJoined,
    onUserLeft,
    onSessionStarted,
    onSessionEnded
  };
};