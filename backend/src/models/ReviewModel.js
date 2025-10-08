const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: [true, 'Session ID is required']
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reviewer ID is required']
    },
    reviewedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reviewed user ID is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    }
}, { timestamps: true });

// Ensure one review per session per reviewer
reviewSchema.index({ sessionId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ reviewedUserId: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);