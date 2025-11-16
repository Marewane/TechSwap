// process.env.TZ = 'UTC'; // Set timezone to UTC for consistency
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Session = require('./models/SessionModel');
const Notification = require('./models/NotificationModel');
const User = require('./models/UserModel');
const { registerSocketServer } = require('./utils/socketRegistry');
const { broadcastNotifications } = require('./utils/notificationEmitter');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import the main app with all routes configured
const app = require('./app');

// Note: All routes are now configured in app.js
// This includes: auth, users, sessions, profile, payments, etc.

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO with CORS
//v2 for testing cors 
// Configure Socket.IO with updated CORS
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://127.0.0.1:5500', // Add this for testing
      'http://localhost:5173',
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make the Socket.IO instance available throughout the app (e.g., inside controllers)
app.set('io', io);
registerSocketServer(io);

// JWT authentication middleware for Socket.IO
const jwt = require('jsonwebtoken');

const emitSessionParticipants = async (sessionId, sessionDoc) => {
  try {
    const normalizedSessionId = sessionId.toString();
    const session = sessionDoc || await Session.findById(normalizedSessionId).select('hostId learnerId');
    if (!session) return;

    const roomName = `session-${normalizedSessionId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const connectedIds = new Set();

    if (room) {
      for (const socketId of room) {
        const memberSocket = io.sockets.sockets.get(socketId);
        if (memberSocket?.userId) {
          connectedIds.add(memberSocket.userId.toString());
        }
      }
    }

    const hostId = session.hostId.toString();
    const learnerId = session.learnerId.toString();

    const payload = {
      sessionId: normalizedSessionId,
      participants: [
        {
          userId: hostId,
          role: 'host',
          isOnline: connectedIds.has(hostId)
        },
        {
          userId: learnerId,
          role: 'learner',
          isOnline: connectedIds.has(learnerId)
        }
      ]
    };

    console.log('session-participants -> room:', roomName);
    console.log('connected socketIds:', Array.from(connectedIds));
    console.log('payload:', payload);

    io.to(roomName).emit('session-participants', payload);
  } catch (error) {
    console.error('emitSessionParticipants error:', error);
  }
};

const authenticateSocket = (socket, next) => {
  try {
    // 1. GET THE TOKEN FROM CLIENT CONNECTION
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.split(' ')[1];
    
    // What this line does:
    // socket.handshake.auth.token → Gets token from: socket.auth.token
    // socket.handshake.headers.authorization?.split(' ')[1] → Gets token from: "Bearer TOKEN_HERE"
    // The ?. is optional chaining (if headers.authorization exists, then split it)
    
    // Example of what client sends:
    // Option A: socket.auth = { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
    // Option B: Authorization header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
      // next() is like next() in Express middleware
      // If we call next() with an error, connection is rejected
    }

    // 2. VERIFY THE JWT TOKEN
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // jwt.verify() checks:
    // - Is token properly signed?
    // - Is token expired?
    // - Is signature valid?
    
    // Example decoded result:
    // {
    //   userId: "68ed1a63453769b1a7cae5d9",
    //   iat: 1761232174,        // issued at
    //   exp: 1761664174         // expires at
    // }
    
    // 3. ATTACH USER INFO TO SOCKET CONNECTION
    socket.userId = decoded.userId;
    // Now every socket connection has: socket.userId available
    // This means we know WHO connected!

    // 4. ALLOW CONNECTION TO CONTINUE
    next(); // No error = connection accepted
  } catch (error) {
    // If token is invalid, expired, or malformed
    next(new Error('Authentication error: Invalid token'));
    // This rejects the connection
  }
};

// // Socket.IO connection handling Apply this authentication to all socket connections
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  const joinedSessions = new Set();
  const userRoom = `user-${socket.userId}`;
  socket.join(userRoom);

  // Join session room with authorization check
  socket.on('join-session', async (sessionId) => {
    try {
      const session = await Session.findById(sessionId);
      
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      const normalizedSessionId = sessionId.toString();
      const isAuthorized = session.hostId.toString() === socket.userId.toString() || 
                         session.learnerId.toString() === socket.userId.toString();
      
      if (!isAuthorized) {
        socket.emit('error', { message: 'Not authorized to join this session' });
        return;
      }

      const roomName = `session-${normalizedSessionId}`;
      socket.join(roomName);
      joinedSessions.add(normalizedSessionId);
      console.log(`User ${socket.userId} joined session ${normalizedSessionId}`);
      
      // Notify other users in the room via socket
      socket.to(roomName).emit('user-joined', {
        userId: socket.userId,
        timestamp: new Date()
      });

      // Create/update notification for the other participant (idempotent)
      try {
        const joiningUser = await User.findById(socket.userId).select('name');
        const otherParticipantId = session.hostId.toString() === socket.userId.toString()
          ? session.learnerId
          : session.hostId;

        const message = `${joiningUser?.name || 'Your session partner'} has joined the session. Join now to start your swap!`;

        const notification = await Notification.findOneAndUpdate(
          {
            userId: otherParticipantId,
            senderId: socket.userId,
            type: 'session_join',
            relatedId: normalizedSessionId,
          },
          {
            $set: {
              title: 'Session Partner Joined!',
              content: message,
              relatedModel: 'Session',
            },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

        console.log(`🔔 session_join notification upserted for user ${otherParticipantId} about ${joiningUser?.name} joining session ${normalizedSessionId}`);

        await broadcastNotifications(notification);
      } catch (notifError) {
        console.error('Error creating session join notification:', notifError);
        // Don't block the session join if notification fails
      }

      await emitSessionParticipants(normalizedSessionId, session);

    } catch (error) {
      console.error('Join session error:', error);
      socket.emit('error', { message: 'Error joining session' });
    }
  });

  socket.on('request-session-participants', async (sessionId) => {
    try {
      if (!sessionId) return;
      const normalizedSessionId = sessionId.toString();
      const session = await Session.findById(normalizedSessionId).select('hostId learnerId');
      if (!session) return;
      await emitSessionParticipants(normalizedSessionId, session);
    } catch (error) {
      console.error('request-session-participants error:', error);
    }
  });

  // Leave session room
  socket.on('leave-session', async (sessionId) => {
    const normalizedSessionId = sessionId.toString();
    const roomName = `session-${normalizedSessionId}`;

    socket.leave(roomName);
    joinedSessions.delete(normalizedSessionId);
    console.log(`User ${socket.userId} left session ${normalizedSessionId}`);
    
    socket.to(roomName).emit('user-left', {
      userId: socket.userId,
      timestamp: new Date()
    });

    await emitSessionParticipants(normalizedSessionId);
  });

  // WebRTC signaling - Handle offer from initiator
  socket.on('webrtc-offer', (data) => {
    try {
      const { offer, targetUserId, sessionId } = data;
      console.log(`📤 Relaying offer from ${socket.userId} to session ${sessionId}`); // ADD THIS
      
      const roomName = `session-${sessionId}`;
      if (socket.rooms.has(roomName)) {
        socket.to(roomName).emit('webrtc-offer', {
          offer,
          from: socket.userId,
          targetUserId
        });
        console.log(`✅ Offer relayed successfully`); // ADD THIS
      } else {
        console.log(`❌ User not in room ${roomName}`); // ADD THIS
      }
    } catch (error) {
      console.error('WebRTC offer error:', error);
      socket.emit('error', { message: 'Error sending offer' });
    }
  });

  // WebRTC signaling - Handle answer from responder
  socket.on('webrtc-answer', (data) => {
    try {
      const { answer, targetUserId, sessionId } = data;
      console.log(`📥 Relaying answer from ${socket.userId} to session ${sessionId}`); // ADDED
      
      const roomName = `session-${sessionId}`;
      if (socket.rooms.has(roomName)) {
        socket.to(roomName).emit('webrtc-answer', {
          answer,
          from: socket.userId,
          targetUserId
        });
        console.log(`✅ Answer relayed successfully`); // ADDED
      } else {
        console.log(`❌ User not in room ${roomName}`); // ADDED
      }
    } catch (error) {
      console.error('WebRTC answer error:', error);
      socket.emit('error', { message: 'Error sending answer' });
    }
  });

  // WebRTC signaling - Handle ICE candidates
  socket.on('webrtc-ice-candidate', (data) => {
    try {
      const { candidate, targetUserId, sessionId } = data;
      console.log(`⚡ Relaying ICE candidate from ${socket.userId} to session ${sessionId}`); // ADDED
      
      const roomName = `session-${sessionId}`;
      if (socket.rooms.has(roomName)) {
        socket.to(roomName).emit('webrtc-ice-candidate', {
          candidate,
          from: socket.userId,
          targetUserId
        });
        console.log(`✅ ICE candidate relayed successfully`); // ADDED
      } else {
        console.log(`❌ User not in room ${roomName}`); // ADDED
      }
    } catch (error) {
      console.error('WebRTC ICE candidate error:', error);
      socket.emit('error', { message: 'Error sending ICE candidate' });
    }
  });

  // Session control events
  socket.on('session-started', (data) => {
    const { sessionId } = data;
    socket.to(`session-${sessionId}`).emit('session-started', {
      startedBy: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('session-ended', (data) => {
    const { sessionId } = data;
    socket.to(`session-${sessionId}`).emit('session-ended', {
      endedBy: socket.userId,
      timestamp: new Date()
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.userId}`);

    for (const sessionId of joinedSessions) {
      const roomName = `session-${sessionId}`;
      socket.to(roomName).emit('user-left', {
        userId: socket.userId,
        timestamp: new Date()
      });
      await emitSessionParticipants(sessionId);
    }

    joinedSessions.clear();
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling
io.on('connection_error', (error) => {
  console.error('Socket connection error:', error);
});

//§§§§§§§§ old code 
// Import the Express app
// const app = require("./app");
//§§§§§§§§§§§§

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

module.exports = { app, io, server };