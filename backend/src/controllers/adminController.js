const User = require('../models/UserModel');
const Review = require('../models/ReviewModel');
const Report = require('../models/ReportModel');
const Session = require('../models/SessionModel');




// ------------User Management for Admin --------------
// List all users 
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // hide password
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Suspend a user
exports.suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = 'suspended';
        await user.save();

        res.json({ message: `User ${user.name} has been suspended.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// unsuspend a user
exports.unsuspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.status = 'active';
        await user.save();
        res.json({ message: `User ${user.name} has been unsuspended.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// remove user
exports.removeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: `User ${user.name} has been removed.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ------------Review Moderation --------------
//get all reviews
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('reviewerId', 'name').populate('reviewedUserId', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ msg: "Review deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ------------Session Oversight--------------
// get all sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate('tutorId', 'name')
            .populate('learnerId', 'name');
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Cancel a session
exports.cancelSession = async (req, res) => {
    try {
        await Session.findByIdAndUpdate(req.params.id, { status: "cancelled" });
        res.json({ msg: "Session cancelled" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ------------Analytics--------------
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
        totalUsers,
        totalSessions,
        totalReviews,
        totalRevenue: totalRevenue[0]?.sum || 0,
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
