const User = require('../models/UserModel');

// @desc    Get matches with flexible filtering (teachers, learners, or both)
// @route   GET /api/matches
// @access  Protected
const getMatches = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            type = 'all', // 'teachers', 'learners', or 'all'
            skill,        // filter by specific skill
            limit = 20
        } = req.query;

        console.log(`🔍 Finding matches - Type: ${type}, Skill: ${skill}`);

        // Get current user with only necessary fields
        const currentUser = await User.findById(userId).select('name skillsToTeach skillsToLearn');
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Build match query based on type
        let matchQuery = {
            _id: { $ne: userId },
            status: 'active' // Only match with active users
        };

        // Add skill-based matching
        if (skill) {
            // Validate if current user has the skill in relevant list
            if (type === 'teachers' && !hasSkillInList(currentUser.skillsToLearn, skill)) {
                return res.status(400).json({
                    success: false,
                    message: `Add "${skill}" to your learning list to find teachers`
                });
            }

            if (type === 'learners' && !hasSkillInList(currentUser.skillsToTeach, skill)) {
                return res.status(400).json({
                    success: false,
                    message: `Add "${skill}" to your teaching list to find learners`
                });
            }

            // Add skill filter to query
            if (type === 'teachers') {
                matchQuery.skillsToTeach = { $regex: skill, $options: 'i' };
            } else if (type === 'learners') {
                matchQuery.skillsToLearn = { $regex: skill, $options: 'i' };
            }
        } else {
            // No specific skill - build comprehensive match query
            matchQuery.$or = [];

            // Teachers: Users who can teach what current user wants to learn
            if (type === 'teachers' || type === 'all') {
                currentUser.skillsToLearn.forEach(skill => {
                    if (skill && skill.trim() !== '') {
                        matchQuery.$or.push({
                            skillsToTeach: { $regex: skill, $options: 'i' }
                        });
                    }
                });
            }

            // Learners: Users who want to learn what current user can teach
            if (type === 'learners' || type === 'all') {
                currentUser.skillsToTeach.forEach(skill => {
                    if (skill && skill.trim() !== '') {
                        matchQuery.$or.push({
                            skillsToLearn: { $regex: skill, $options: 'i' }
                        });
                    }
                });
            }

            // Remove $or if empty to avoid MongoDB error
            if (matchQuery.$or.length === 0) {
                delete matchQuery.$or;
            }
        }

        console.log('📋 Match query:', JSON.stringify(matchQuery, null, 2));

        // Find potential matches with only essential fields
        const potentialMatches = await User.find(matchQuery)
            .select('name avatar bio skillsToTeach skillsToLearn rating totalSession createdAt')
            .limit(parseInt(limit))
            .sort({ rating: -1, totalSession: -1, createdAt: -1 });

        console.log('✅ Found potential matches:', potentialMatches.length);

        // If no specific type or skill, calculate comprehensive matches with scores
        let matches = potentialMatches;
        if (!skill && type === 'all') {
            matches = potentialMatches.map(match => {
                const matchInfo = calculateMatchInfo(currentUser, match);
                return {
                    ...getEssentialUserData(match),
                    matchScore: matchInfo.score,
                    matchReasons: matchInfo.reasons,
                    matchType: matchInfo.type,
                    compatibility: `${matchInfo.score}%`
                };
            });

            // Sort by match score (highest first)
            matches.sort((a, b) => b.matchScore - a.matchScore);
        } else {
            // For filtered searches, return simple match info
            matches = potentialMatches.map(match => {
                const matchInfo = getFilteredMatchInfo(currentUser, match, type, skill);
                return {
                    ...getEssentialUserData(match),
                    matchReasons: matchInfo.reasons,
                    matchType: matchInfo.type
                };
            });
        }

        // Build response with minimal current user data
        const response = {
            success: true,
            data: {
                currentUser: {
                    name: currentUser.name,
                    skillsToTeach: currentUser.skillsToTeach,
                    skillsToLearn: currentUser.skillsToLearn
                },
                filters: {
                    type,
                    skill: skill || null,
                    limit: parseInt(limit)
                },
                matches,
                totalMatches: matches.length
            }
        };

        // Add helpful message for empty results
        if (matches.length === 0) {
            if (skill) {
                response.data.message = `No ${type} found for "${skill}". Try a different skill or check your profile.`;
            } else {
                response.data.message = 'No matches found. Add more skills to your profile to get better matches.';
            }
        }

        res.status(200).json(response);
        
    } catch (error) {
        console.error('❌ Get matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finding matches: ' + error.message
        });
    }
};

// ==================== HELPER FUNCTIONS ====================

// @desc    Get essential user data for matches (minimal fields)
const getEssentialUserData = (user) => {
    return {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        rating: user.rating,
        totalSession: user.totalSession,
        memberSince: user.createdAt
    };
};

// @desc    Calculate comprehensive match information
const calculateMatchInfo = (currentUser, matchUser) => {
    let score = 0;
    const reasons = [];
    let type = 'potential';

    // Current user wants to learn what match user can teach
    const learnFromMatch = currentUser.skillsToLearn.filter(wantSkill => 
        hasSkillInList(matchUser.skillsToTeach, wantSkill)
    ).length;

    // Match user wants to learn what current user can teach
    const teachToMatch = matchUser.skillsToLearn.filter(wantSkill => 
        hasSkillInList(currentUser.skillsToTeach, wantSkill)
    ).length;

    // Calculate base score
    const totalPossible = currentUser.skillsToLearn.length + matchUser.skillsToLearn.length;
    if (totalPossible > 0) {
        score = Math.round(((learnFromMatch + teachToMatch) / totalPossible) * 100);
    }

    // Add reasons and determine type
    if (learnFromMatch > 0) {
        reasons.push(`They can teach ${learnFromMatch} skill(s) you want to learn`);
        type = 'teacher';
    }

    if (teachToMatch > 0) {
        reasons.push(`They want to learn ${teachToMatch} skill(s) you can teach`);
        type = type === 'teacher' ? 'mutual' : 'learner';
    }

    // Bonus for mutual matches
    if (learnFromMatch > 0 && teachToMatch > 0) {
        score = Math.min(score + 20, 100);
        reasons.push('Great mutual learning opportunity!');
    }

    return { score, reasons: reasons.slice(0, 3), type };
};

// @desc    Get match info for filtered searches
const getFilteredMatchInfo = (currentUser, matchUser, type, skill) => {
    const reasons = [];
    
    if (type === 'teachers' && skill) {
        const matchingSkills = matchUser.skillsToTeach.filter(teachSkill =>
            teachSkill.toLowerCase().includes(skill.toLowerCase())
        );
        reasons.push(`Expert in: ${matchingSkills.join(', ')}`);
    } else if (type === 'learners' && skill) {
        const wantingSkills = matchUser.skillsToLearn.filter(learnSkill =>
            learnSkill.toLowerCase().includes(skill.toLowerCase())
        );
        reasons.push(`Wants to learn: ${wantingSkills.join(', ')}`);
    } else if (type === 'teachers') {
        const teachableSkills = currentUser.skillsToLearn.filter(wantSkill =>
            hasSkillInList(matchUser.skillsToTeach, wantSkill)
        );
        if (teachableSkills.length > 0) {
            reasons.push(`Can teach you: ${teachableSkills.slice(0, 2).join(', ')}`);
        }
    } else if (type === 'learners') {
        const learnableSkills = matchUser.skillsToLearn.filter(wantSkill =>
            hasSkillInList(currentUser.skillsToTeach, wantSkill)
        );
        if (learnableSkills.length > 0) {
            reasons.push(`Wants to learn: ${learnableSkills.slice(0, 2).join(', ')}`);
        }
    }

    return { reasons: reasons.length > 0 ? reasons : ['Potential match based on skills'], type };
};

// @desc    Check if a skill exists in a list (case insensitive partial match)
const hasSkillInList = (skillList, targetSkill) => {
    if (!targetSkill) return false;
    return skillList.some(skill => 
        skill && skill.toLowerCase().includes(targetSkill.toLowerCase())
    );
};

module.exports = {
    getMatches
};