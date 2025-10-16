const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protect all profile routes
router.use(authMiddleware);

// @route   GET /api/profile/view
router.get('/view', getProfile);

// @route   PUT /api/profile/update
router.put('/update', updateProfile);

module.exports = router;