// backend/src/routes/matchingRoutes.js
const express = require('express');
const router = express.Router();
const {
    getMatchSuggestions,
    findTeachersForSkill,
    findLearnersForSkill
} = require('../controllers/matchingController');

const { authMiddleware} = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(authMiddleware);

// @route   GET /api/matches/suggestions/:userId
router.get('/suggestions/:userId', getMatchSuggestions);

// @route   GET /api/matches/teachers/:userId/:skill
router.get('/teachers/:userId/:skill', findTeachersForSkill);

// @route   GET /api/matches/learners/:userId/:skill
router.get('/learners/:userId/:skill', findLearnersForSkill);

module.exports = router;