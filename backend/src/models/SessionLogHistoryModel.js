const mongoose = require('mongoose');

const sessionHistoryLogSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Session ID is required']
    },
    action: {
        type: String,
        enum: ['created', 'updated', 'cancelled', 'completed', 'rescheduled'],
        required: [true, 'Action is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    details: {
        type: Object,
        default: {}
    }
}, { timestamps: true });

// Indexes
sessionHistoryLogSchema.index({ sessionId: 1, createdAt: -1 });
sessionHistoryLogSchema.index({ userId: 1 });

module.exports = mongoose.model('SessionHistoryLog', sessionHistoryLogSchema);