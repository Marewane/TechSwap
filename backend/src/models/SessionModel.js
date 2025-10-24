const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // The two participants in the session
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host ID is required']
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Learner ID is required']
  },
  
  // Session details
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  duration: {
    type: Number,
    default: 120, // 2 hours in minutes - AUTO SET
    immutable: true // Cannot be changed after creation
  },
  status: {
    type: String,
    enum: ['scheduled', 'ready', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  title: {
    type: String,
    required: [true, 'Session title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Both session types available
  sessionType: {
    type: String,
    enum: ['skillExchange', 'skillTeaching'],
    default: 'skillExchange'
  },
  
  // Live session fields
  webRTCRoomId: {
    type: String,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  
  // Track actual session duration (for analytics only)
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  
  // Business logic: If session extends, create NEW session
  extendedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null // Original session has no parent
  },
  isExtended: {
    type: Boolean,
    default: false // True if this is a continuation
  }
  
}, { 
  timestamps: true 
});

// Indexes for performance
sessionSchema.index({ hostId: 1, scheduledTime: -1 });
sessionSchema.index({ learnerId: 1, status: 1 });
sessionSchema.index({ scheduledTime: 1 });
sessionSchema.index({ webRTCRoomId: 1 }); // For quick room lookup

// Pre-save hook to auto-generate webRTCRoomId when session starts
sessionSchema.pre('save', function(next) {
  // Auto-generate WebRTC room ID when session goes in-progress
  if (this.isModified('status') && this.status === 'in-progress' && !this.webRTCRoomId) {
    this.webRTCRoomId = `session-${this._id}-${Date.now()}`;
  }
  
  // Auto-set duration to 2 hours if not provided
  if (!this.duration) {
    this.duration = 120; // 2 hours
  }
  
  next();
});

module.exports = mongoose.model('Session', sessionSchema);


// ready: When scheduled time arrives → "Lobby available"
// in-progress: When host clicks "Start Session" → "Teaching begins"
// no-show: When time passes, no one joined → "No one showed up"
// cancelled: When someone clicks "Cancel" → "Session cancelled"
