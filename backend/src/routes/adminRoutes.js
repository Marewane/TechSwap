const express = require("express");
const router = express.Router();
// controller
const adminController = require("../controllers/adminController");
// middleware
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Protect all admin routes
// router.use(authMiddleware, adminMiddleware);

// USER MANAGEMENT
router.get('/users/role/user',adminController.getAllUsers); // list all normal users
router.get('/users/role/admin',adminController.getAllAdmins); // list all admins
router.patch("/users/:id/role", adminController.updateUserRole); // update user role
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
router.get("/sessions", adminController.getAllSessions); // list all sessions
router.patch("/sessions/:id/cancel", adminController.cancelSession); // cancel a session

// Analytics and Reporting
router.get("/dashboard", adminController.getDashboardStats); // get platform analytics
router.get("/transactions", adminController.getTransactions); // list all transactions with filters, search, pagination

module.exports = router;
