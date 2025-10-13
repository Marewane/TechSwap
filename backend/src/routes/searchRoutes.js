const express = require('express');
const router = express.Router();
const { 
    searchUsers, 
    getSkills, 
    getSearchStats 
} = require('../controllers/searchController');

// @route   GET /api/users/search
// @query   q: string (general search - name, bio, skills)
// @query   skill: string (specific skill search)
// @query   type: 'teach' | 'learn' | 'both' (skill type)
// @query   minRating: number (minimum rating filter)
// @query   maxRating: number (maximum rating filter)
// @query   sortBy: 'rating' | 'sessions' | 'newest' | 'name'
// @query   page: number (default: 1)
// @query   limit: number (default: 20)
router.get('/search', searchUsers);

// @route   GET /api/users/skills
// @query   type: 'teach' | 'learn' | 'both' (default: 'both')
// @query   limit: number (default: 20)
// @query   minCount: number (minimum usage count, default: 1)
router.get('/skills', getSkills);

// @route   GET /api/users/stats
// @desc    Get search statistics and featured users
router.get('/stats', getSearchStats);

module.exports = router;