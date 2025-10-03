const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: [true, 'Wallet ID is required']
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: [true, 'Transaction type is required']
    },
    amount: {
        type: Number,
        min: 0,
        required: [true, 'Amount is required']
    },
    balanceAfter: {
        type: Number,
        required: [true, 'Balance after transaction is required']
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        default: null
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    stripePaymentId: {
        type: String,
        default: null
    },
    // Optional: link to the other party
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

// Indexes
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ sessionId: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);