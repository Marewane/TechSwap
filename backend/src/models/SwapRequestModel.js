const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  
  // Scheduling
  scheduledTime: { type: Date },
  duration: { type: Number },

  createdAt: { type: Date, default: Date.now }
});

swapRequestSchema.index({ postId: 1, requesterId: 1 }, { unique: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);