const express = require('express');
const router = express.Router();
const {
    getMyProfile,
    getUserProfile,
    updateProfile
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protect all profile routes
router.use(authMiddleware);

// @route   GET /api/profile/me
router.get('/me', getMyProfile);

// @route   GET /api/profile/user/:userId
router.get('/user/:userId', getUserProfile);

// @route   PUT /api/profile/update
router.put('/update', updateProfile);

module.exports = router;