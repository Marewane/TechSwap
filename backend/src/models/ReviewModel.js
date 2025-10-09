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
        enum: [1, 2, 3, 4, 5],
        required: [true, 'Rating is required']
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        trim: true
    }
}, { timestamps: true });

// Ensure one review per session per reviewer
reviewSchema.index({ sessionId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ reviewedUserId: 1, rating: -1 });

// Prevent self-review at schema level (additional controller checks still recommended)
reviewSchema.pre('validate', function(next) {
  if (this.reviewerId && this.reviewedUserId && this.reviewerId.toString() === this.reviewedUserId.toString()) {
    return next(new Error('Reviewer and reviewed user must be different'));
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);