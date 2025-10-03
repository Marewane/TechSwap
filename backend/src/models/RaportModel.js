const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reporter ID is required']
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reported user ID is required']
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        default: null
    },
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    }
}, { timestamps: true });

// Indexes : will help us in searching 
reportSchema.index({ reportedUserId: 1, status: 1 });
reportSchema.index({ reporterId: 1 });

module.exports = mongoose.model('Report', reportSchema);