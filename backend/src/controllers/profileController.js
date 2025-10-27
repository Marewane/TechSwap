const User = require('../models/UserModel');
const Review = require('../models/ReviewModel');

// @desc    Get own profile (authenticated user)
// @route   GET /api/profile/me
// @access  Protected
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('name email role avatar bio skillsToLearn skillsToTeach rating totalSession lastLogin isEmailVerified createdAt');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: user,
                isOwner: true
            }
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

// @desc    Get user profile by ID (for guests viewing other profiles)
// @route   GET /api/profile/user/:userId
// @access  Protected (but can view other users' profiles)
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Check if user is viewing their own profile
        const isOwner = userId === currentUserId.toString();

        if (isOwner) {
            return getMyProfile(req, res);
        }

        // Exclude sensitive information for guest view
        const user = await User.findById(userId).select('name avatar bio skillsToTeach rating totalSession createdAt');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's reviews
        const reviews = await Review.find({ reviewedUserId: userId })
            .populate('reviewerId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(10);

        // Format reviews for frontend
        const formattedReviews = reviews.map(review => ({
            id: review._id,
            reviewerName: review.reviewerId.name,
            reviewerAvatar: review.reviewerId.avatar,
            date: review.createdAt,
            rating: review.rating,
            comment: review.comment
        }));

        res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    avatar: user.avatar,
                    bio: user.bio,
                    skillsToTeach: user.skillsToTeach,
                    rating: user.rating,
                    totalSession: user.totalSession,
                    createdAt: user.createdAt
                },
                isOwner: false,
                reviews: formattedReviews
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user profile'
        });
    }
};

// @desc    Update user profile - ONLY OWNER CAN UPDATE
// @route   PUT /api/profile/update
// @access  Protected
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required with at least one field to update'
            });
        }

        const { 
            name, 
            bio, 
            avatar, 
            skillsToTeach,
            skillsToLearn,
            addTeachingSkill,
            addLearningSkill,
            removeTeachingSkill,
            removeLearningSkill
        } = req.body;

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let updatedSkillsToTeach = [...currentUser.skillsToTeach];
        let updatedSkillsToLearn = [...currentUser.skillsToLearn];

        // Handle complete array replacement
        if (skillsToTeach !== undefined) {
            if (!Array.isArray(skillsToTeach)) {
                return res.status(400).json({
                    success: false,
                    message: 'skillsToTeach must be an array'
                });
            }
            updatedSkillsToTeach = [...new Set(skillsToTeach.map(skill => skill.trim()).filter(skill => skill.length > 0))];
        }

        if (skillsToLearn !== undefined) {
            if (!Array.isArray(skillsToLearn)) {
                return res.status(400).json({
                    success: false,
                    message: 'skillsToLearn must be an array'
                });
            }
            updatedSkillsToLearn = [...new Set(skillsToLearn.map(skill => skill.trim()).filter(skill => skill.length > 0))];
        }

        // Handle single skill operations
        if (addTeachingSkill && typeof addTeachingSkill === 'string') {
            const skill = addTeachingSkill.trim();
            if (skill && !updatedSkillsToTeach.includes(skill)) {
                updatedSkillsToTeach.push(skill);
            }
        }

        if (addLearningSkill && typeof addLearningSkill === 'string') {
            const skill = addLearningSkill.trim();
            if (skill && !updatedSkillsToLearn.includes(skill)) {
                updatedSkillsToLearn.push(skill);
            }
        }

        if (removeTeachingSkill && typeof removeTeachingSkill === 'string') {
            const skill = removeTeachingSkill.trim();
            updatedSkillsToTeach = updatedSkillsToTeach.filter(s => s !== skill);
        }

        if (removeLearningSkill && typeof removeLearningSkill === 'string') {
            const skill = removeLearningSkill.trim();
            updatedSkillsToLearn = updatedSkillsToLearn.filter(s => s !== skill);
        }

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (avatar !== undefined) updateFields.avatar = avatar;
        
        updateFields.skillsToTeach = updatedSkillsToTeach;
        updateFields.skillsToLearn = updatedSkillsToLearn;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update provided'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { 
                new: true,
                runValidators: true
            }
        ).select('name email avatar bio skillsToTeach skillsToLearn rating totalSession lastLogin isEmailVerified createdAt');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found after update'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
};

module.exports = {
    getMyProfile,
    getUserProfile,
    updateProfile
};