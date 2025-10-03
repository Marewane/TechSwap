const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
