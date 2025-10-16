const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    type: {
        type: String,
        enum: ['offer', 'request', 'general'],
        required: [true, 'Post type is required']
    },
    skillsOffered: {
        type: [String],
        default: []
    },
    skillsWanted: {
        type: [String],
        default: []
    },
    status: { 
        type: String,
        enum: ['active', 'pending', 'accepted', 'rejected', 'filled', 'expired'], 
        default: 'active' 
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        maxlength: [1000, 'Content cannot exceed 1000 characters']
    },
    tags: {
        type: [String],
        default: []
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    likes: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Indexes : this will help us in searching and also for performance searching is good
postSchema.index({ userId: 1, status: 1 });
postSchema.index({ type: 1, expiresAt: 1 });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-remove expired

module.exports = mongoose.model('Post', postSchema);