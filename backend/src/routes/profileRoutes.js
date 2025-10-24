const express = require('express');
const router = express.Router();
const {
    getMyProfile,
    getUserProfile,
    updateProfile
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protect all profile routes with JWT authentication
router.use(authMiddleware);

// @route   GET /api/profile/me
// @desc    Get authenticated user's own profile
// @access  Private
router.get('/me', getMyProfile);

// @route   GET /api/profile/user/:userId
// @desc    Get user profile by ID (for viewing other users' profiles)
// @access  Private
router.get('/user/:userId', getUserProfile);

// @route   PUT /api/profile/update
// @desc    Update authenticated user's profile
// @access  Private
router.put('/update', updateProfile);

module.exports = router;