const express = require("express");
const router = express.Router();
// controller
const adminController = require("../controllers/adminController");
// middleware
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(authMiddleware, adminMiddleware);

// USER MANAGEMENT
router.get('/users', adminController.getUsers); // comprehensive users list with pagination, search, filtering
router.get('/users/role/user',adminController.getAllUsers); // list all normal users
router.get('/users/role/admin',adminController.getAllAdmins); // list all admins
router.patch("/users/:id/role", adminController.updateUserRole); // update user role
router.patch("/users/:id/status", adminController.updateUserStatus); // update user status (active/suspended)
router.patch("/users/:id/suspend", adminController.suspendUser); // suspend user
router.patch("/users/:id/unsuspend", adminController.unsuspendUser); // unsuspend user

// REVIEW MODERATION
router.get("/reviews", adminController.getAllReviews); // list all reviews
router.delete("/reviews/:id", adminController.deleteReview); // delete a review

// REPORT MANAGEMENT 
router.get('/reports', adminController.getReports);
router.get('/reports/:id', adminController.getReportById);
router.patch('/reports/:id/status', adminController.updateReportStatus);
router.delete('/reports/:id', adminController.deleteReport);

// SESSION OVERSIGHT
router.get("/sessions", adminController.getSessions); // comprehensive sessions list with pagination, search, filtering
router.get("/sessions/all", adminController.getAllSessions); // list all sessions (legacy)
router.patch("/sessions/:id/status", adminController.updateSessionStatus); // update session status
router.patch("/sessions/:id/cancel", adminController.cancelSession); // cancel a session

// Analytics and Reporting
router.get("/dashboard", adminController.getDashboardStats); // get platform analytics
router.get("/transactions", adminController.getTransactions); // list all transactions with filters, search, pagination

module.exports = router;
