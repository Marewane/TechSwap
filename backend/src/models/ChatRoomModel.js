const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    swapRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
    
    // Scheduling info
    scheduledTime: { type: Date },
    duration: { type: Number },

    // Payment status
    hostPaid: { type: Boolean, default: false },
    learnerPaid: { type: Boolean, default: false },

    // Final session
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null }
  },
  { timestamps: true }
);

chatRoomSchema.index({ hostId: 1, createdAt: -1 });
chatRoomSchema.index({ learnerId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);