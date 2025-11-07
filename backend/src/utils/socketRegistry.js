let ioInstance = null;

const registerSocketServer = (io) => {
  ioInstance = io;
};

const getSocketServer = () => ioInstance;

const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return;
  try {
    const room = `user-${userId.toString()}`;
    ioInstance.to(room).emit(event, payload);
  } catch (error) {
    console.error(`Failed to emit event ${event} to user ${userId}:`, error);
  }
};

module.exports = {
  registerSocketServer,
  getSocketServer,
  emitToUser,
};

