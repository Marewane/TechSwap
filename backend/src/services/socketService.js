// This file can contain socket utility functions
// We'll expand this as needed for WebRTC functionality

class SocketService {
  constructor(io) {
    this.io = io;
  }

  // Verify user is authorized to join session room
  async isUserAuthorizedForSession(userId, sessionId) {
    try {
      const Session = require('../models/SessionModel');
      const session = await Session.findById(sessionId);
      
      if (!session) return false;
      
      return session.hostId.toString() === userId.toString() || 
             session.learnerId.toString() === userId.toString();
    } catch (error) {
      console.error('Authorization check error:', error);
      return false;
    }
  }

  // Join session room with authorization
  async joinSessionRoom(socket, sessionId) {
    const isAuthorized = await this.isUserAuthorizedForSession(socket.userId, sessionId);
    
    if (isAuthorized) {
      socket.join(`session-${sessionId}`);
      return true;
    }
    return false;
  }

  // Get users in session room
  getUsersInSession(sessionId) {
    const room = this.io.sockets.adapter.rooms.get(`session-${sessionId}`);
    return room ? Array.from(room) : [];
  }
}

module.exports = SocketService;