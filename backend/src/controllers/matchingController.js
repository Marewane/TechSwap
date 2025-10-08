// backend/src/controllers/matchingController.js
const User = require('../models/UserModel');

// @desc    Get suggested matches for a user
// @route   GET /api/matches/suggestions/:userId
// @access  Public
const getMatchSuggestions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        // Get the current user
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find potential matches
        const potentialMatches = await User.find({
            _id: { $ne: userId }, // Exclude current user
            $or: [
                // Users who can teach what current user wants to learn
                { 
                    skillsToTeach: { 
                        $in: currentUser.skillsToLearn.map(skill => new RegExp(skill, 'i'))
                    } 
                },
                // Users who want to learn what current user can teach
                { 
                    skillsToLearn: { 
                        $in: currentUser.skillsToTeach.map(skill => new RegExp(skill, 'i'))
                    } 
                }
            ]
        })
        .select('-password')
        .limit(parseInt(limit));

        // Calculate match scores and add match reasons
        const matchesWithScores = potentialMatches.map(match => {
            const score = calculateMatchScore(currentUser, match);
            const reasons = getMatchReasons(currentUser, match);
            
            return {
                user: match,
                matchScore: score,
                matchReasons: reasons,
                compatibility: `${score}%`
            };
        });

        // Sort by match score (highest first)
        matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({
            success: true,
            data: {
                currentUser: {
                    name: currentUser.name,
                    skillsToTeach: currentUser.skillsToTeach,
                    skillsToLearn: currentUser.skillsToLearn
                },
                matches: matchesWithScores,
                totalMatches: matchesWithScores.length
            }
        });
    } catch (error) {
        console.error('Get match suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding matches'
        });
    }
};

// @desc    Calculate match score between two users (0-100)
const calculateMatchScore = (userA, userB) => {
    let score = 0;
    
    // User A wants to learn what User B can teach
    const aLearnsFromB = userA.skillsToLearn.filter(skillWant => 
        userB.skillsToTeach.some(skillTeach => 
            skillTeach.toLowerCase().includes(skillWant.toLowerCase())
        )
    ).length;

    // User B wants to learn what User A can teach  
    const bLearnsFromA = userB.skillsToLearn.filter(skillWant => 
        userA.skillsToTeach.some(skillTeach => 
            skillTeach.toLowerCase().includes(skillWant.toLowerCase())
        )
    ).length;

    // Calculate score based on mutual learning opportunities
    const totalPossibleMatches = userA.skillsToLearn.length + userB.skillsToLearn.length;
    const actualMatches = aLearnsFromB + bLearnsFromA;

    if (totalPossibleMatches > 0) {
        score = Math.round((actualMatches / totalPossibleMatches) * 100);
    }

    // Bonus for mutual matches (both can teach each other)
    if (aLearnsFromB > 0 && bLearnsFromA > 0) {
        score += 20; // Bonus for mutual learning
    }

    return Math.min(score, 100); // Cap at 100%
};

// @desc    Get reasons why users are matched
const getMatchReasons = (userA, userB) => {
    const reasons = [];

    // What User A can learn from User B
    userA.skillsToLearn.forEach(skillWant => {
        userB.skillsToTeach.forEach(skillTeach => {
            if (skillTeach.toLowerCase().includes(skillWant.toLowerCase())) {
                reasons.push(`You want to learn ${skillWant} and they can teach ${skillTeach}`);
            }
        });
    });

    // What User B can learn from User A  
    userB.skillsToLearn.forEach(skillWant => {
        userA.skillsToTeach.forEach(skillTeach => {
            if (skillTeach.toLowerCase().includes(skillWant.toLowerCase())) {
                reasons.push(`They want to learn ${skillWant} and you can teach ${skillTeach}`);
            }
        });
    });

    return reasons.slice(0, 3); // Return top 3 reasons
};

// @desc    Find users who can teach a specific skill the current user wants to learn
// @route   GET /api/matches/teachers/:userId/:skill
// @access  Public
const findTeachersForSkill = async (req, res) => {
    try {
        const { userId, skill } = req.params;
        const { limit = 10 } = req.query;

        // Verify the current user wants to learn this skill
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const wantsToLearnSkill = currentUser.skillsToLearn.some(s => 
            s.toLowerCase().includes(skill.toLowerCase())
        );

        if (!wantsToLearnSkill) {
            return res.status(400).json({
                success: false,
                message: `You don't have ${skill} in your learning list`
            });
        }

        // Find users who can teach this skill
        const teachers = await User.find({
            _id: { $ne: userId },
            skillsToTeach: { $regex: skill, $options: 'i' }
        })
        .select('-password')
        .limit(parseInt(limit))
        .sort({ rating: -1 });

        res.status(200).json({
            success: true,
            data: {
                skill: skill,
                currentUser: currentUser.name,
                teachers: teachers,
                totalTeachers: teachers.length
            }
        });
    } catch (error) {
        console.error('Find teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding teachers'
        });
    }
};

// @desc    Find users who want to learn a specific skill the current user can teach
// @route   GET /api/matches/learners/:userId/:skill
// @access  Public
const findLearnersForSkill = async (req, res) => {
    try {
        const { userId, skill } = req.params;
        const { limit = 10 } = req.query;

        // Verify the current user can teach this skill
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const canTeachSkill = currentUser.skillsToTeach.some(s => 
            s.toLowerCase().includes(skill.toLowerCase())
        );

        if (!canTeachSkill) {
            return res.status(400).json({
                success: false,
                message: `You don't have ${skill} in your teaching list`
            });
        }

        // Find users who want to learn this skill
        const learners = await User.find({
            _id: { $ne: userId },
            skillsToLearn: { $regex: skill, $options: 'i' }
        })
        .select('-password')
        .limit(parseInt(limit))
        .sort({ rating: -1 });

        res.status(200).json({
            success: true,
            data: {
                skill: skill,
                currentUser: currentUser.name,
                learners: learners,
                totalLearners: learners.length
            }
        });
    } catch (error) {
        console.error('Find learners error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding learners'
        });
    }
};

module.exports = {
    getMatchSuggestions,
    findTeachersForSkill,
    findLearnersForSkill
};