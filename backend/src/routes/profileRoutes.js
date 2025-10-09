const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    addTeachingSkill,
    addLearningSkill,
    removeTeachingSkill,
    removeLearningSkill
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protect all profile routes
router.use(authMiddleware);

// ✅ FIXED: Remove :userId from URLs
// @route   GET /api/profile/view
router.get('/view', getProfile);

// @route   PUT /api/profile/update
router.put('/update', updateProfile);

// @route   POST /api/profile/skills/teach
router.post('/skills/teach', addTeachingSkill);

// @route   POST /api/profile/skills/learn
router.post('/skills/learn', addLearningSkill);

// @route   DELETE /api/profile/skills/teach
router.delete('/skills/teach', removeTeachingSkill);

// @route   DELETE /api/profile/skills/learn
router.delete('/skills/learn', removeLearningSkill);

module.exports = router;