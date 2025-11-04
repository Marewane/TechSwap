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

router.get('/me', authMiddleware, getMyProfile);
router.put('/update', authMiddleware, updateProfile);

// public route (no authMiddleware)
router.get('/user/:userId', getUserProfile);


module.exports = router;