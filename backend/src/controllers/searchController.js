// src/controllers/searchController.js
const User = require('../models/UserModel');

// @desc    Search users by skills with filters
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
    try {
        const { 
            skill, 
            type, // 'teach' or 'learn'
            minRating,
            limit = 10,
            page = 1 
        } = req.query;

        // Build search query
        let query = {};
        
        // Search by skill
        if (skill) {
            const skillRegex = new RegExp(skill, 'i');
            
            if (type === 'teach') {
                query.skillsToTeach = skillRegex;
            } else if (type === 'learn') {
                query.skillsToLearn = skillRegex;
            } else {
                query.$or = [
                    { skillsToTeach: skillRegex },
                    { skillsToLearn: skillRegex }
                ];
            }
        }

        // Filter by minimum rating
        if (minRating) {
            query.rating = { $gte: parseFloat(minRating) };
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute search
        const users = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ rating: -1, createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching users'
        });
    }
};

// @desc    Get users who can teach a specific skill
// @route   GET /api/users/teachers/:skill
// @access  Public
const getTeachersBySkill = async (req, res) => {
    try {
        const { skill } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const skip = (page - 1) * limit;

        const skillRegex = new RegExp(skill, 'i');

        const users = await User.find({
            skillsToTeach: skillRegex
        })
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ rating: -1 });

        const total = await User.countDocuments({
            skillsToTeach: skillRegex
        });

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching teachers'
        });
    }
};

// @desc    Get popular skills
// @route   GET /api/users/skills/popular
// @access  Public
const getPopularSkills = async (req, res) => {
    try {
        const users = await User.find().select('skillsToTeach skillsToLearn');
        
        const allSkills = [];
        users.forEach(user => {
            allSkills.push(...user.skillsToTeach);
            allSkills.push(...user.skillsToLearn);
        });

        // Count skill frequency
        const skillCount = {};
        allSkills.forEach(skill => {
            if (skill) {
                skillCount[skill] = (skillCount[skill] || 0) + 1;
            }
        });

        // Get top 10 popular skills
        const popularSkills = Object.entries(skillCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([skill]) => skill);

        res.status(200).json({
            success: true,
            data: popularSkills
        });
    } catch (error) {
        console.error('Get popular skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching popular skills'
        });
    }
};

module.exports = {
    searchUsers,
    getTeachersBySkill,
    getPopularSkills
};