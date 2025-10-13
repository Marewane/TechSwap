const User = require('../models/UserModel');
const { paginate, buildPaginationResponse } = require('../utils/pagination');

// @desc    Unified search endpoint for users with flexible filters
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
    try {
        const { 
            q, // General search term (name, bio, skills)
            skill, // Specific skill to search for
            type, // 'teach', 'learn', or 'both'
            minRating,
            maxRating,
            sortBy = 'rating', // 'rating', 'sessions', 'newest', 'name'
            limit = 20,
            page = 1
        } = req.query;

        console.log(`🔍 Search query:`, { q, skill, type, minRating, maxRating, sortBy });

        // Build search query
        let query = { status: 'active' }; // Only active users

        // General search (name, bio, or skills)
        if (q) {
            const searchRegex = new RegExp(q, 'i');
            query.$or = [
                { name: searchRegex },
                { bio: searchRegex },
                { skillsToTeach: searchRegex },
                { skillsToLearn: searchRegex }
            ];
        }

        // Skill-specific search
        if (skill) {
            const skillRegex = new RegExp(skill, 'i');
            
            if (type === 'teach') {
                query.skillsToTeach = skillRegex;
            } else if (type === 'learn') {
                query.skillsToLearn = skillRegex;
            } else {
                // Default: search both teaching and learning skills
                query.$or = [
                    { skillsToTeach: skillRegex },
                    { skillsToLearn: skillRegex }
                ];
            }
        }

        // Rating filters
        if (minRating || maxRating) {
            query.rating = {};
            if (minRating) query.rating.$gte = parseFloat(minRating);
            if (maxRating) query.rating.$lte = parseFloat(maxRating);
        }

        // Sort options
        let sort = {};
        switch (sortBy) {
            case 'sessions':
                sort = { totalSession: -1, rating: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'name':
                sort = { name: 1 };
                break;
            case 'rating':
            default:
                sort = { rating: -1, totalSession: -1 };
        }

        // Select only essential fields
        const selectFields = 'name avatar bio skillsToTeach skillsToLearn rating totalSession createdAt';

        // Use pagination utility
        const { results: users, pagination } = await paginate(User, query, {
            page: parseInt(page),
            limit: Math.min(50, parseInt(limit)), // Cap at 50 for performance
            sort,
            select: selectFields
        });

        // Transform data to minimal format
        const minimalUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
            skillsToTeach: user.skillsToTeach,
            skillsToLearn: user.skillsToLearn,
            rating: user.rating,
            totalSessions: user.totalSession,
            memberSince: user.createdAt
        }));

        // Add search metadata
        const searchMeta = {
            query: q || null,
            skill: skill || null,
            type: type || 'both',
            filters: {
                minRating: minRating || null,
                maxRating: maxRating || null,
                sortBy
            }
        };

        res.status(200).json({
            success: true,
            data: minimalUsers,
            meta: searchMeta,
            pagination,
            ...(users.length === 0 && { message: 'No users found matching your criteria' })
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching users'
        });
    }
};

// @desc    Get popular skills with usage counts
// @route   GET /api/users/skills
// @access  Public
const getSkills = async (req, res) => {
    try {
        const { 
            type = 'both', // 'teach', 'learn', or 'both'
            limit = 20,
            minCount = 1
        } = req.query;

        console.log(`📊 Getting popular skills - Type: ${type}`);

        const users = await User.find({ status: 'active' })
            .select('skillsToTeach skillsToLearn')
            .lean();

        // Count skill frequency
        const teachCount = {};
        const learnCount = {};
        const allCount = {};

        users.forEach(user => {
            // Count teaching skills
            user.skillsToTeach.forEach(skill => {
                if (skill && skill.trim()) {
                    const cleanSkill = skill.trim();
                    teachCount[cleanSkill] = (teachCount[cleanSkill] || 0) + 1;
                    allCount[cleanSkill] = (allCount[cleanSkill] || 0) + 1;
                }
            });

            // Count learning skills
            user.skillsToLearn.forEach(skill => {
                if (skill && skill.trim()) {
                    const cleanSkill = skill.trim();
                    learnCount[cleanSkill] = (learnCount[cleanSkill] || 0) + 1;
                    allCount[cleanSkill] = (allCount[cleanSkill] || 0) + 1;
                }
            });
        });

        // Filter by minimum count and get top skills
        let skills = [];
        const countMap = type === 'teach' ? teachCount : 
                        type === 'learn' ? learnCount : allCount;

        skills = Object.entries(countMap)
            .filter(([_, count]) => count >= parseInt(minCount))
            .sort(([,a], [,b]) => b - a)
            .slice(0, parseInt(limit))
            .map(([skill, count]) => ({
                skill,
                count,
                type: type === 'both' ? 
                    { 
                        teachers: teachCount[skill] || 0, 
                        learners: learnCount[skill] || 0 
                    } : undefined
            }));

        res.status(200).json({
            success: true,
            data: skills,
            meta: {
                type,
                limit: parseInt(limit),
                minCount: parseInt(minCount),
                totalSkills: skills.length
            }
        });

    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching skills'
        });
    }
};

// @desc    Get user stats and search suggestions
// @route   GET /api/users/stats
// @access  Public
const getSearchStats = async (req, res) => {
    try {
        const [totalUsers, topRatedUsers, recentUsers] = await Promise.all([
            User.countDocuments({ status: 'active' }),
            User.find({ status: 'active' })
                .select('name avatar rating skillsToTeach')
                .sort({ rating: -1 })
                .limit(5)
                .lean(),
            User.find({ status: 'active' })
                .select('name avatar createdAt skillsToLearn')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        // Get quick skill stats
        const users = await User.find({ status: 'active' })
            .select('skillsToTeach skillsToLearn')
            .lean();

        const allSkills = [];
        users.forEach(user => {
            allSkills.push(...user.skillsToTeach, ...user.skillsToLearn);
        });

        const uniqueSkills = [...new Set(allSkills.filter(skill => skill && skill.trim()))];
        const avgSkillsPerUser = allSkills.length / Math.max(totalUsers, 1);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                skillStats: {
                    totalUniqueSkills: uniqueSkills.length,
                    avgSkillsPerUser: Math.round(avgSkillsPerUser * 10) / 10
                },
                featured: {
                    topRated: topRatedUsers.map(user => ({
                        name: user.name,
                        avatar: user.avatar,
                        rating: user.rating,
                        expertise: user.skillsToTeach.slice(0, 2)
                    })),
                    newUsers: recentUsers.map(user => ({
                        name: user.name,
                        avatar: user.avatar,
                        lookingFor: user.skillsToLearn.slice(0, 2)
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Get search stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching search stats'
        });
    }
};

module.exports = {
    searchUsers,
    getSkills,
    getSearchStats
};