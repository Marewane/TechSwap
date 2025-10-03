// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.use(auth, requireRole(["admin"])); // all routes admin-only

// USER MANAGEMENT
router.get("/users", adminController.getUsers);
router.patch("/users/:id/suspend", adminController.suspendUser);
router.patch("/users/:id/unsuspend", adminController.unsuspendUser);
router.delete("/users/:id", adminController.deleteUser);

// REVIEW MODERATION
router.delete("/reviews/:id", adminController.deleteReview);

// SESSION OVERSIGHT
router.get("/sessions", adminController.getSessions);
router.patch("/sessions/:id/cancel", adminController.cancelSession);

// REPORTS
router.get("/reports", adminController.getReports);

module.exports = router;
