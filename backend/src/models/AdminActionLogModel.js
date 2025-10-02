const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin ID is required']
    },
    actionType: {
        type: String,
        enum: ['create', 'update', 'delete', 'ban', 'unban', 'refund', 'approve', 'reject'],
        required: [true, 'Action type is required']
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Target user ID is required']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
}, { timestamps: true });

// Indexes : this is will help us in searching 
adminActionLogSchema.index({ adminId: 1, createdAt: -1 });
adminActionLogSchema.index({ targetUserId: 1 });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);