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

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        if (req.user && req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot change your own role." });
        }

        const oldRole = user.role;
        const newRole = oldRole === "user" ? "admin" : "user";
        user.role = newRole;
        await user.save();

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "update",
            targetUserId: user._id,
            description: `Role changed from ${oldRole} → ${newRole}`,
        });

        return res.status(200).json({
            success: true,
            message: `User ${user.name}'s role updated from ${oldRole} to ${newRole}.`,
            data: { userId: user._id, newRole },
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating user role.",
            error: error.message,
        });
    }
};

exports.suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isSuspended = true;
        await user.save();

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "ban",
            targetUserId: user._id,
            description: `Suspended user ${user.name}`,
        });

        res.json({ success: true, message: `User ${user.name} has been suspended.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.unsuspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isSuspended = false;
        await user.save();

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "unban",
            targetUserId: user._id,
            description: `Unsuspended user ${user.name}`,
        });

        res.json({ success: true, message: `User ${user.name} has been unsuspended.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "delete",
            targetUserId: user._id,
            description: `Deleted user ${user.name}`,
        });

        res.json({ success: true, message: `User ${user.name} has been removed.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------ REVIEW MODERATION --------------

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("reviewerId", "name")
            .populate("reviewedUserId", "name");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "delete",
            targetUserId: review.reviewedUserId,
            description: `Deleted review ${review._id}`,
        });

        res.json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------ REPORT MANAGEMENT --------------

exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporterId", "name email")
            .populate("reportedUserId", "name email")
            .populate("sessionId", "title")
            .lean();

        res.status(200).json({
            success: true,
            total: reports.length,
            reports,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "update",
            targetUserId: report.reportedUserId,
            description: `Changed report ${report._id} status to ${status}`,
        });

        res.json({ success: true, message: "Report status updated", report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "delete",
            targetUserId: report.reportedUserId,
            description: `Deleted report ${report._id}`,
        });

        res.json({ success: true, message: "Report deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ------------ SESSION OVERSIGHT --------------

exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find()
            .populate("hostId", "name")
            .populate("learnerId", "name");
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelSession = async (req, res) => {
    try {
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { status: "cancelled" },
            { new: true }
        );
        if (!session) return res.status(404).json({ success: false, message: "Session not found" });

        const adminId = req.user?._id || "000000000000000000000000";

        await logAdminAction({
            adminId,
            actionType: "update",
            targetUserId: session.learnerId,
            description: `Cancelled session ${session._id}`,
        });

        res.json({ success: true, message: "Session cancelled" });
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
