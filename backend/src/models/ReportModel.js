const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: false // some reports may be about sessions/users, not only reviews
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: false
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
