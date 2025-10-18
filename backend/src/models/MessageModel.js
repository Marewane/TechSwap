const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: false },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender ID is required']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'emoji'],
        default: 'text'
    },
    read: {
        type: Boolean,
        default: false
    }
    // Removed 'timestamp' — use 'createdAt' from timestamps
}, { timestamps: true });

// Indexes
messageSchema.index({ sessionId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);