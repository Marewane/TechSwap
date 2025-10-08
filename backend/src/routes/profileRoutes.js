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

// @route   GET /api/profile/view/:userId
router.get('/view/:userId', getProfile);

// @route   PUT /api/profile/update/:userId
router.put('/update/:userId', updateProfile);

// @route   POST /api/profile/skills/teach/:userId
router.post('/skills/teach/:userId', addTeachingSkill);

// @route   POST /api/profile/skills/learn/:userId
router.post('/skills/learn/:userId', addLearningSkill);

// @route   DELETE /api/profile/skills/teach/:userId
router.delete('/skills/teach/:userId', removeTeachingSkill);

// @route   DELETE /api/profile/skills/learn/:userId
router.delete('/skills/learn/:userId', removeLearningSkill);

module.exports = router;