// src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { 
    searchUsers, 
    getTeachersBySkill, 
    getPopularSkills 
} = require('../controllers/searchController');

// const { authMiddleware} = require('../middleware/authMiddleware');

// // Protect all admin routes
// router.use(authMiddleware);

// @route   GET /api/users/search
router.get('/search', searchUsers);

// @route   GET /api/users/teachers/:skill
router.get('/teachers/:skill', getTeachersBySkill);

// @route   GET /api/users/skills/popular
router.get('/skills/popular', getPopularSkills);

module.exports = router;