const express = require('express');
const router = express.Router();
const { getMatches } = require('../controllers/matchingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Protect all matching routes
router.use(authMiddleware);

// @route   GET /api/matches
// @query   type: 'teachers' | 'learners' | 'all' (default: 'all')
// @query   skill: string (optional - filter by specific skill)
// @query   limit: number (default: 20)
router.get('/', getMatches);

module.exports = router;