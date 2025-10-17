const User = require('../models/UserModel');
const Review = require('../models/ReviewModel');
const Report = require('../models/RaportModel'); 
const Session = require('../models/SessionModel');
const Transaction = require('../models/TranscationModel');
const AdminActionLog = require("../models/AdminActionLogModel");

const logAdminAction = async ({ adminId, actionType, targetUserId, description }) => {
    try {
        await AdminActionLog.create({ adminId, actionType, targetUserId, description });
    } catch (error) {
        console.error("Failed to log admin action:", error.message);
    }
};

// ------------ FETCH USERS BY ROLE --------------

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json({
            success: true,
            total: users.length,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message,
        });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.status(200).json({
            success: true,
            total: admins.length,
            admins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admins',
            error: error.message,
        });
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

exports.getReports = async (req, res) => {
    try {
        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || "all";
        const search = req.query.search || "";
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

        // Build filter query
        const query = {};

        // Status filter
        if (status !== "all") {
            query.status = status;
        }

        // Calculate skip
        const skip = (page - 1) * limit;

        // Get total count
        const totalReports = await Report.countDocuments(query);

        // Fetch reports with population
        let reports = await Report.find(query)
            .populate("reporterId", "name email avatar")
            .populate("reportedUserId", "name email avatar")
            .populate("sessionId", "title scheduledAt")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        // Search filter (after population)
        if (search) {
            reports = reports.filter(report => {
                const reporterName = report.reporterId?.name?.toLowerCase() || "";
                const reportedName = report.reportedUserId?.name?.toLowerCase() || "";
                const reason = report.reason?.toLowerCase() || "";
                const searchLower = search.toLowerCase();
                
                return reporterName.includes(searchLower) || 
                        reportedName.includes(searchLower) || 
                        reason.includes(searchLower);
            });
        }

        // Calculate pagination
        const totalPages = Math.ceil(totalReports / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Get status counts for filter badges
        const statusCounts = await Report.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = {
            all: totalReports,
            pending: 0,
            reviewed: 0,
            resolved: 0
        };

        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReports,
                    limit,
                    hasNextPage,
                    hasPrevPage
                },
                counts
            }
        });

    } catch (error) {
        console.error("Get reports error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching reports",
            error: error.message
        });
    }
};

// Get single report details
exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate("reporterId", "name email avatar phone")
            .populate("reportedUserId", "name email avatar phone")
            .populate("sessionId")
            .lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error("Get report by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching report details",
            error: error.message
        });
    }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'reviewed', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: pending, reviewed, resolved"
            });
        }

        const report = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )
        .populate("reporterId", "name email")
        .populate("reportedUserId", "name email");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Report status updated successfully",
            data: report
        });

    } catch (error) {
        console.error("Update report status error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating report status",
            error: error.message
        });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findByIdAndDelete(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Report deleted successfully"
        });

    } catch (error) {
        console.error("Delete report error:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting report",
            error: error.message
        });
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
// ------------ DASHBOARD ANALYTICS --------------
exports.getDashboardStats = async (req, res) => {
    try {
        // 1️⃣ Basic counts
        const [totalUsers, totalSessions, totalReports] = await Promise.all([
            User.countDocuments(),
            Session.countDocuments(),
            Report.countDocuments()
        ]);

        // 2️⃣ Total Revenue (from platformShare)
        const totalRevenueAgg = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: "$platformShare" } } }
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;

// 3️⃣ Monthly Revenue for LAST 6 MONTHS - FIXED
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

const monthlyRevenue = await Transaction.aggregate([
    {
        $addFields: {
            // Convert createdAt to Date if it's a string
            createdAtDate: {
                $cond: {
                    if: { $eq: [{ $type: "$createdAt" }, "string"] },
                    then: { $toDate: "$createdAt" },
                    else: "$createdAt"
                }
            }
        }
    },
    {
        // Filter for last 6 months
        $match: {
            createdAtDate: { $gte: sixMonthsAgo }
        }
    },
    {
        $group: {
            // Group by both year AND month
            _id: {
                year: { $year: "$createdAtDate" },
                month: { $month: "$createdAtDate" }
            },
            total: { $sum: "$platformShare" }
        }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
]);

// Generate last 6 months array with year
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const last6Months = [];
const currentDate = new Date();

for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    last6Months.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        monthNum: date.getMonth() + 1
    });
}

// Map revenue data to last 6 months (fill with 0 if no data)
const formattedRevenue = last6Months.map(item => {
    const found = monthlyRevenue.find(
        m => m._id.month === item.monthNum && m._id.year === item.year
    );
    return {
        month: `${item.month} ${item.year}`,
        revenue: found ? found.total : 0
    };
});

        // 4️⃣ Recent 5 Transactions
        const recentTransactions = await Transaction.find()
            .populate("fromUserId", "name")
            .populate("toUserId", "name")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // 5️⃣ Return response
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalSessions,
                totalReports,
                totalRevenue
            },
            monthlyRevenue: formattedRevenue,
            recentTransactions
        });

    } catch (error) {
        console.error("Dashboard analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Error generating dashboard analytics",
            error: error.message
        });
    }
};
// ------------ TRANSACTION OVERSIGHT --------------
exports.getTransactions = async (req, res) => {
    try {
        // Get query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const type = req.query.type || "all";
        const sortBy = req.query.sortBy || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

        // Build filter query
        const query = {};

        // Type filter
        if (type !== "all") {
            query.type = type;
        }

        // Search filter (description, or user names)
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Calculate skip
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalTransactions = await Transaction.countDocuments(query);

        // Fetch transactions
        const transactions = await Transaction.find(query)
            .populate("fromUserId", "name email")
            .populate("toUserId", "name email")
            .populate("walletId", "balance")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        // If search includes user names, we need to filter after population
        let filteredTransactions = transactions;
        if (search) {
            filteredTransactions = transactions.filter(t => {
                const desc = t.description?.toLowerCase() || "";
                const fromUser = t.fromUserId?.name?.toLowerCase() || "";
                const toUser = t.toUserId?.name?.toLowerCase() || "";
                const searchLower = search.toLowerCase();
                
                return desc.includes(searchLower) || 
                        fromUser.includes(searchLower) || 
                        toUser.includes(searchLower);
            });
        }

        // Calculate pagination info
        const totalPages = Math.ceil(totalTransactions / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            success: true,
            data: {
                transactions: filteredTransactions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalTransactions,
                    limit,
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching transactions",
            error: error.message
        });
    }
};