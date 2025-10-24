// process.env.TZ = 'UTC'; // Set timezone to UTC for consistency
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS: Security - controls who can access your API
// JSON: Functionality - parses request data for your controllers

// // Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend URL
  credentials: true     // Allow cookies/tokens
}));
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);

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

// JWT authentication middleware for Socket.IO
const jwt = require('jsonwebtoken');

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

  // Join session room with authorization check
  socket.on('join-session', async (sessionId) => {
    try {
      // Import Session model to check authorization
      const Session = require('./models/SessionModel');
      const session = await Session.findById(sessionId);
      
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Check if user is authorized to join this session
      const isAuthorized = session.hostId.toString() === socket.userId.toString() || 
                         session.learnerId.toString() === socket.userId.toString();
      
      if (!isAuthorized) {
        socket.emit('error', { message: 'Not authorized to join this session' });
        return;
      }

      // Join the session room
      socket.join(`session-${sessionId}`);
      console.log(`User ${socket.userId} joined session ${sessionId}`);
      
      // Notify other users in the room
      socket.to(`session-${sessionId}`).emit('user-joined', {
        userId: socket.userId,
        timestamp: new Date()
      });

      // Send current participants to the joining user
      const room = io.sockets.adapter.rooms.get(`session-${sessionId}`);
      const participants = room ? Array.from(room) : [];
      socket.emit('session-participants', {
        participants,
        sessionId
      });

    } catch (error) {
      console.error('Join session error:', error);
      socket.emit('error', { message: 'Error joining session' });
    }
  });

  // Leave session room
  socket.on('leave-session', (sessionId) => {
    socket.leave(`session-${sessionId}`);
    console.log(`User ${socket.userId} left session ${sessionId}`);
    
    socket.to(`session-${sessionId}`).emit('user-left', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // WebRTC signaling - Handle offer from initiator
  socket.on('webrtc-offer', (data) => {
    try {
      const { offer, targetUserId, sessionId } = data;
      
      // Verify user is in the session room
      const roomName = `session-${sessionId}`;
      if (socket.rooms.has(roomName)) {
        // Send offer to target user only
        socket.to(roomName).emit('webrtc-offer', {
          offer,
          from: socket.userId,
          targetUserId
        });
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
      
      const roomName = `session-${sessionId}`;
      if (socket.rooms.has(roomName)) {
        // Send answer back to the original offerer
        socket.to(roomName).emit('webrtc-answer', {
          answer,
          from: socket.userId,
          targetUserId
        });
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
      
      const roomName = `session-${sessionId}`;
      if (socket.rooms.has(roomName)) {
        // Send ICE candidate to target user
        socket.to(roomName).emit('webrtc-ice-candidate', {
          candidate,
          from: socket.userId,
          targetUserId
        });
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
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
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