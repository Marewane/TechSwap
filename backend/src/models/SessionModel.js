const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
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
    scheduledTime: {
        type: Date,
        required: [true, 'Scheduled time is required']
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'in-progress'],
        default: 'scheduled'
    },
    cost: {
        type: Number,
        min: 0,
        required: [true, 'Cost is required']
    },
    duration: {
        type: Number,
        min: 15, // duration it will be in minutes
        required: [true, 'Duration is required']
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
    sessionType: {
        type: String,
        enum: ['skillExchange', 'skillTeaching'],
        required: [true, 'Session type is required'],
        default:'skillExchange'
    },
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
    }
}, { timestamps: true });

// Indexes : this is gonna help us in searching
sessionSchema.index({ hostId: 1, scheduledTime: -1 });
sessionSchema.index({ learnerId: 1, status: 1 });
sessionSchema.index({ scheduledTime: 1 });

module.exports = mongoose.model('Session', sessionSchema);