// src/hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

// Assuming your backend URL is defined in an environment variable
// e.g., VITE_API_BASE_URL=http://localhost:5000 in your .env file
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useSocket = (token) => { // Expect the JWT token as a prop
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (!token) {
      console.error('No authentication token provided for Socket.IO connection.');
      setConnectionError('Authentication token is missing.');
      return;
    }

    // Close any existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log(`Attempting to connect to Socket.IO server at ${SOCKET_URL}`);

    // Create a new Socket.IO connection with authentication
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token, // Pass the JWT token for authentication
      },
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 5, // Limit reconnection attempts
      reconnectionDelay: 1000, // Initial delay between reconnection attempts (ms)
      reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts (ms)
      randomizationFactor: 0.5, // Randomization factor for reconnection delays
    });

    newSocket.on('connect', () => {
      console.log(`Socket.IO connected with ID: ${newSocket.id}`);
      setIsConnected(true);
      setConnectionError(null);
      setSocket(newSocket); // Update state socket
      socketRef.current = newSocket; // Update ref
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnected(false);
      setSocket(null); // Update state socket
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Socket.IO disconnected. Reason: ${reason}`);
      setIsConnected(false);
      setSocket(null); // Update state socket

      // Handle manual disconnection vs. unexpected disconnection
      if (reason === 'io client disconnect' || reason === 'io server disconnect') {
        // Manual disconnection, don't attempt to reconnect
        console.log('Manual disconnection. Not attempting to reconnect.');
      } else {
        // Unexpected disconnection, rely on built-in reconnection logic
        console.log('Unexpected disconnection. Relying on reconnection logic.');
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket.IO generic error:', error);
      setConnectionError(error.message || 'An unknown error occurred.');
    });

    // Note: Don't store newSocket in socketRef.current here yet,
    // as the connection process is asynchronous.
    // Store it only after the 'connect' event fires.
    // For now, we just initiate the connection.
    // socketRef.current = newSocket; // <- Removed from here
  }, [token]); // Reconnect if the token changes

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Manually disconnecting Socket.IO client.');
      socketRef.current.disconnect(); // This triggers the 'disconnect' listener
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
    }
  }, []);

  // --- Session Specific Event Emitters ---
  // These functions will emit events to the server related to session management

  const joinSession = useCallback((sessionId) => {
    // Check if the socket instance exists and is connected
    // Use socketRef.current for the actual socket instance
    if (socketRef.current && socketRef.current.connected) {
      console.log(`Emitting 'join-session' for session ID: ${sessionId}`);
      // FIX: Send the sessionId directly as the argument, not wrapped in an object
      socketRef.current.emit('join-session', sessionId);
    } else {
      console.warn('Cannot join session: Socket is not connected.');
      setConnectionError('Not connected to the server.');
    }
  }, []); // No dependencies needed as it uses socketRef

  const leaveSession = useCallback((sessionId) => {
    // Check if the socket instance exists and is connected
    if (socketRef.current && socketRef.current.connected) {
      console.log(`Emitting 'leave-session' for session ID: ${sessionId}`);
      // FIX: Send the sessionId directly as the argument, not wrapped in an object
      socketRef.current.emit('leave-session', sessionId);
    } else {
      console.warn('Cannot leave session: Socket is not connected.');
    }
  }, []); // No dependencies needed as it uses socketRef

  // --- WebRTC Signaling Event Emitters ---
  // These functions will emit WebRTC signaling events

  const sendOffer = useCallback((data) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting WebRTC offer:', data);
      socketRef.current.emit('webrtc-offer', data);
    } else {
      console.warn('Cannot send offer: Socket is not connected.');
    }
  }, []);

  const sendAnswer = useCallback((data) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting WebRTC answer:', data);
      socketRef.current.emit('webrtc-answer', data);
    } else {
      console.warn('Cannot send answer: Socket is not connected.');
    }
  }, []);

  const sendIceCandidate = useCallback((data) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting WebRTC ICE candidate:', data.candidate?.candidate?.substring(0, 50) + '...');
      socketRef.current.emit('webrtc-ice-candidate', data);
    } else {
      console.warn('Cannot send ICE candidate: Socket is not connected.');
    }
  }, []);

  // --- Session Control Event Emitters ---

  const sendSessionStarted = useCallback((data) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting session started:', data);
      socketRef.current.emit('session-started', data);
    } else {
      console.warn('Cannot send session started: Socket is not connected.');
    }
  }, []);

  const sendSessionEnded = useCallback((data) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log('Emitting session ended:', data);
      socketRef.current.emit('session-ended', data);
    } else {
      console.warn('Cannot send session ended: Socket is not connected.');
    }
  }, []);

  // --- Cleanup on unmount ---
  useEffect(() => {
    // Return a cleanup function to disconnect the socket when the component unmounts
    return () => {
      console.log('Cleaning up Socket.IO connection on hook unmount.');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setSocket(null);
      setConnectionError(null);
    };
  }, []); // Run only once on mount/unmount

  return {
    socket, // This will be the connected socket instance or null
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendSessionStarted,
    sendSessionEnded,
  };
};

export default useSocket;