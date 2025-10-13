const express = require("express");
const router = express.Router();
// controller
const adminController = require("../controllers/adminController");
// middleware
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(authMiddleware, adminMiddleware);

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
router.get('/reports', adminController.getAllReports); // list all reports
router.put('/reports/:id/status', adminController.updateReportStatus); // update report status

// SESSION OVERSIGHT
router.get("/sessions", adminController.getAllSessions); // list all sessions
router.patch("/sessions/:id/cancel", adminController.cancelSession); // cancel a session

// Analytics and Reporting
router.get("/Analytics", adminController.getReports); 

module.exports = router;
