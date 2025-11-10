const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    type: {
        type: String,
        enum: ['swap', 'teach', 'learn'],
        default: 'swap'
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
    skillsOffered: {
        type: [String],
        default: []
    },
    skillsWanted: {
        type: [String],
        default: []
    },
    availability: {
        days: {
            type: [String],
            default: []
        },
        startTime: {
            type: String,
            default: ""
        },
        endTime: {
            type: String,
            default: ""
        }
    },
    timeSlotsAvailable: {
        type: [String],
        default: []
    },
    // Snapshot of author identity at creation time to ensure listings
    // can render even if the user record is later removed or not populated.
    authorName: {
        type: String,
        default: ""
    },
    authorAvatar: {
        type: String,
        default: ""
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, { timestamps: true });

postSchema.index({ userId: 1 });
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Post', postSchema);