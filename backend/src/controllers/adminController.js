const User = require('../models/UserModel');
const Review = require('../models/ReviewModel');
const Report = require('../models/RaportModel'); 
const Session = require('../models/SessionModel');
const Wallet = require('../models/WalletModel');
const AdminActionLog = require("../models/AdminActionLogModel");

const logAdminAction = async ({ adminId, actionType, targetUserId, description }) => {
    try {
        await AdminActionLog.create({ adminId, actionType, targetUserId, description });
    } catch (error) {
        console.error("Failed to log admin action:", error.message);
    }
};

// ------------ USER MANAGEMENT --------------

// List all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // hide password
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });

        const oldRole = user.role;
        user.role = oldRole === 'user' ? 'admin' : 'user';
        await user.save();

        if (req.user) {
        await logAdminAction({
            adminId: req.user._id,
            actionType: 'update',
            targetUserId: user._id,
            description: `Changed role from ${oldRole} to ${user.role}`
        });
        }

        res.json({
        success: true,
        message: `User ${user.name} role changed from ${oldRole} to ${user.role}.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Suspend user
exports.suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });

        user.isSuspended = true;
        await user.save();

        if (req.user) {
        await logAdminAction({
            adminId: req.user._id,
            actionType: 'ban',
            targetUserId: user._id,
            description: `Suspended user ${user.name}`
        });
        }

        res.json({ success: true, message: `User ${user.name} has been suspended.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Unsuspend user
exports.unsuspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });

        user.isSuspended = false;
        await user.save();

        if (req.user) {
        await logAdminAction({
            adminId: req.user._id,
            actionType: 'unban',
            targetUserId: user._id,
            description: `Unsuspended user ${user.name}`
        });
        }

        res.json({ success: true, message: `User ${user.name} has been unsuspended.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove user
exports.removeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
        return res.status(404).json({ success: false, message: 'User not found' });

        if (req.user) {
        await logAdminAction({
            adminId: req.user._id,
            actionType: 'delete',
            targetUserId: user._id,
            description: `Deleted user ${user.name}`
        });
        }

        res.json({ success: true, message: `User ${user.name} has been removed.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------ REVIEW MODERATION --------------

// Get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
        .populate('reviewerId', 'name')
        .populate('reviewedUserId', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review)
        return res.status(404).json({ success: false, message: 'Review not found' });

        if (req.user) {
        await logAdminAction({
            adminId: req.user._id,
            actionType: 'delete',
            targetUserId: review.reviewedUserId,
            description: `Deleted review ${review._id}`
        });
        }

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------ SESSION OVERSIGHT --------------

// Get all sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
        .populate('tutorId', 'name')
        .populate('learnerId', 'name');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };

// Cancel a session
exports.cancelSession = async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled' },
        { new: true }
        );
        if (!session)
        return res.status(404).json({ success: false, message: 'Session not found' });

        if (req.user) {
        await logAdminAction({
            adminId: req.user._id,
            actionType: 'update',
            targetUserId: session.learnerId,
            description: `Cancelled session ${session._id}`
        });
        }

        res.json({ success: true, message: 'Session cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------ ANALYTICS --------------
exports.getReports = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSessions = await Session.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalRevenue = await Wallet.aggregate([
        { $unwind: "$transactions" },
        { $group: { _id: null, sum: { $sum: "$transactions.amount" } } },
        ]);

        res.json({
        success: true,
        totalUsers,
        totalSessions,
        totalReviews,
        totalRevenue: totalRevenue[0]?.sum || 0,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
