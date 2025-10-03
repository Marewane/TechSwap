const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    balance: {
        type: Number,
        min: 0,
        default: 0
    },
    totalEarned: {
        type: Number,
        min: 0,
        default: 0
    },
    totalSpent: {
        type: Number,
        min: 0,
        default: 0
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'INR'],
        default: 'USD'
    }
}, { timestamps: true });

// Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ balance: -1 });

module.exports = mongoose.model('Wallet', walletSchema);