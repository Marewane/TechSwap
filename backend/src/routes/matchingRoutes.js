const express = require('express');
const router = express.Router();
const {
    getMatchSuggestions,
    findTeachersForSkill,
    findLearnersForSkill
} = require('../controllers/matchingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protect all matching routes
router.use(authMiddleware);

// ✅ FIXED: Remove :userId from URLs - user comes from auth token
// @route   GET /api/matches/suggestions
router.get('/suggestions', getMatchSuggestions);

// @route   GET /api/matches/teachers/:skill
router.get('/teachers/:skill', findTeachersForSkill);

// @route   GET /api/matches/learners/:skill  
router.get('/learners/:skill', findLearnersForSkill);

module.exports = router;