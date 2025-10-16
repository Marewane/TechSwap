const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    type: {
        type: String,
        enum: ['session', 'message', 'review', 'payment', 'system', 'swap_accepted', 'swap_rejected'],
        required: [true, 'Notification type is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: [500, 'Content cannot exceed 500 characters']
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null }, // can be swapRequestId, postId, sessionId, etc.
    relatedModel: {
        type: String,
        enum: ['Session', 'Message', 'Review', 'Transaction', 'Post'],
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes : this will help us in searching it is good for performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);