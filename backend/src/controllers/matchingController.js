const User = require('../models/UserModel');

// @desc    Get suggested matches for a user
// @route   GET /api/matches/suggestions
// @access  Protected
const getMatchSuggestions = async (req, res) => {
    try {
        console.log('🔍 Starting match suggestions...');
        
        // Get user ID from auth middleware
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        console.log('👤 User ID:', userId);

        // Get the current user (authenticated user)
        const currentUser = await User.findById(userId);
        console.log('✅ Current user found:', currentUser ? currentUser.name : 'NOT FOUND');
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('🎯 Current user skills - Teach:', currentUser.skillsToTeach);
        console.log('🎯 Current user skills - Learn:', currentUser.skillsToLearn);

        // If user has no skills, return empty matches
        if (currentUser.skillsToTeach.length === 0 && currentUser.skillsToLearn.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    currentUser: {
                        name: currentUser.name,
                        skillsToTeach: currentUser.skillsToTeach,
                        skillsToLearn: currentUser.skillsToLearn
                    },
                    matches: [],
                    totalMatches: 0,
                    message: 'Add skills to your profile to get match suggestions'
                }
            });
        }

        // Build the match query
        let matchQuery = {
            _id: { $ne: userId } // Exclude current user
        };

        // Only add skill matching if user has skills
        if (currentUser.skillsToLearn.length > 0 || currentUser.skillsToTeach.length > 0) {
            matchQuery.$or = [];
            
            // Users who can teach what current user wants to learn
            if (currentUser.skillsToLearn.length > 0) {
                currentUser.skillsToLearn.forEach(skill => {
                    if (skill && skill.trim() !== '') {
                        matchQuery.$or.push({
                            skillsToTeach: { $regex: skill, $options: 'i' }
                        });
                    }
                });
            }
            
            // Users who want to learn what current user can teach
            if (currentUser.skillsToTeach.length > 0) {
                currentUser.skillsToTeach.forEach(skill => {
                    if (skill && skill.trim() !== '') {
                        matchQuery.$or.push({
                            skillsToLearn: { $regex: skill, $options: 'i' }
                        });
                    }
                });
            }
        }

        console.log('📋 Match query:', JSON.stringify(matchQuery, null, 2));

        // Find potential matches
        const potentialMatches = await User.find(matchQuery)
            .select('-password')
            .limit(parseInt(limit))
            .sort({ rating: -1, createdAt: -1 });

        console.log('✅ Found potential matches:', potentialMatches.length);

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

        console.log('✅ Final matches with scores:', matchesWithScores.length);

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
        console.error('❌ Get match suggestions error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while finding matches: ' + error.message
        });
    }
};

// @desc    Calculate match score between two users (0-100)
const calculateMatchScore = (userA, userB) => {
    try {
        let score = 0;
        
        // User A wants to learn what User B can teach
        const aLearnsFromB = userA.skillsToLearn.filter(skillWant => {
            if (!skillWant) return false;
            return userB.skillsToTeach.some(skillTeach => 
                skillTeach && skillTeach.toLowerCase().includes(skillWant.toLowerCase())
            );
        }).length;

        // User B wants to learn what User A can teach  
        const bLearnsFromA = userB.skillsToLearn.filter(skillWant => {
            if (!skillWant) return false;
            return userA.skillsToTeach.some(skillTeach => 
                skillTeach && skillTeach.toLowerCase().includes(skillWant.toLowerCase())
            );
        }).length;

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
    } catch (error) {
        console.error('❌ Error in calculateMatchScore:', error);
        return 0;
    }
};

// @desc    Get reasons why users are matched
const getMatchReasons = (userA, userB) => {
    try {
        const reasons = [];

        // What User A can learn from User B
        userA.skillsToLearn.forEach(skillWant => {
            if (!skillWant) return;
            userB.skillsToTeach.forEach(skillTeach => {
                if (skillTeach && skillTeach.toLowerCase().includes(skillWant.toLowerCase())) {
                    reasons.push(`You want to learn ${skillWant} and they can teach ${skillTeach}`);
                }
            });
        });

        // What User B can learn from User A  
        userB.skillsToLearn.forEach(skillWant => {
            if (!skillWant) return;
            userA.skillsToTeach.forEach(skillTeach => {
                if (skillTeach && skillTeach.toLowerCase().includes(skillWant.toLowerCase())) {
                    reasons.push(`They want to learn ${skillWant} and you can teach ${skillTeach}`);
                }
            });
        });

        return reasons.slice(0, 3); // Return top 3 reasons
    } catch (error) {
        console.error('❌ Error in getMatchReasons:', error);
        return ['Match found based on skill compatibility'];
    }
};

// @desc    Find users who can teach a specific skill the current user wants to learn
// @route   GET /api/matches/teachers/:skill
// @access  Protected
const findTeachersForSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skill } = req.params;
        const { limit = 10 } = req.query;

        console.log(`👨‍🏫 Finding teachers for skill: ${skill}`);

        // Verify the current user wants to learn this skill
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const wantsToLearnSkill = currentUser.skillsToLearn.some(s => 
            s && s.toLowerCase().includes(skill.toLowerCase())
        );

        if (!wantsToLearnSkill) {
            return res.status(400).json({
                success: false,
                message: `You don't have "${skill}" in your learning list. Add it to find teachers.`
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
                teachers: teachers.map(teacher => ({
                    user: teacher,
                    canTeach: teacher.skillsToTeach.filter(s => 
                        s.toLowerCase().includes(skill.toLowerCase())
                    )
                })),
                totalTeachers: teachers.length
            }
        });
    } catch (error) {
        console.error('Find teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding teachers: ' + error.message
        });
    }
};

// @desc    Find users who want to learn a specific skill the current user can teach
// @route   GET /api/matches/learners/:skill
// @access  Protected
const findLearnersForSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skill } = req.params;
        const { limit = 10 } = req.query;

        console.log(`👨‍🎓 Finding learners for skill: ${skill}`);

        // Verify the current user can teach this skill
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const canTeachSkill = currentUser.skillsToTeach.some(s => 
            s && s.toLowerCase().includes(skill.toLowerCase())
        );

        if (!canTeachSkill) {
            return res.status(400).json({
                success: false,
                message: `You don't have "${skill}" in your teaching list. Add it to find learners.`
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
                learners: learners.map(learner => ({
                    user: learner,
                    wantsToLearn: learner.skillsToLearn.filter(s => 
                        s.toLowerCase().includes(skill.toLowerCase())
                    )
                })),
                totalLearners: learners.length
            }
        });
    } catch (error) {
        console.error('Find learners error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding learners: ' + error.message
        });
    }
};

module.exports = {
    getMatchSuggestions,
    findTeachersForSkill,
    findLearnersForSkill
};