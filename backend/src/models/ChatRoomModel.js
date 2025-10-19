const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The post owner
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // The person who sent the swap request
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    swapRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
      required: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null, // Filled later after scheduling
    },
  },
  { timestamps: true }
);


module.exports =  mongoose.model('ChatRoom', chatRoomSchema);
