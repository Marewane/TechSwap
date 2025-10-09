const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: function() { return !this.isPlatform; } // required if not platform
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
    },
    // this field is used for help us to decide which transaction will go to either platform or user in case of skill swaping and not teaching 
    isPlatform: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for searching
walletSchema.index({ userId: 1 });
walletSchema.index({ balance: -1 });
walletSchema.index({ isPlatform: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
