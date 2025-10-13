const User = require('../models/UserModel');

// @desc    Get user profile (essential data only)
// @route   GET /api/profile/view
// @access  Protected
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('name email role avatar bio skillsToLearn skillsToTeach rating totalSession lastLogin isEmailVerified createdAt');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
};

// @desc    Update user profile (handles all updates including skills)
// @route   PUT /api/profile/update
// @access  Protected
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
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
            skillsToTeach,  // Replace entire teaching skills array
            skillsToLearn,  // Replace entire learning skills array
            addTeachingSkill,    // Single skill to add to teaching
            addLearningSkill,    // Single skill to add to learning  
            removeTeachingSkill, // Single skill to remove from teaching
            removeLearningSkill  // Single skill to remove from learning
        } = req.body;

        // Get current user to work with existing data
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Start with current skills
        let updatedSkillsToTeach = [...currentUser.skillsToTeach];
        let updatedSkillsToLearn = [...currentUser.skillsToLearn];

        // Handle complete array replacement (highest priority)
        if (skillsToTeach !== undefined) {
            if (!Array.isArray(skillsToTeach)) {
                return res.status(400).json({
                    success: false,
                    message: 'skillsToTeach must be an array'
                });
            }
            // Clean and validate the array
            updatedSkillsToTeach = [...new Set(skillsToTeach.map(skill => skill.trim()).filter(skill => skill.length > 0))];
        }

        if (skillsToLearn !== undefined) {
            if (!Array.isArray(skillsToLearn)) {
                return res.status(400).json({
                    success: false,
                    message: 'skillsToLearn must be an array'
                });
            }
            // Clean and validate the array
            updatedSkillsToLearn = [...new Set(skillsToLearn.map(skill => skill.trim()).filter(skill => skill.length > 0))];
        }

        // Handle single skill additions (medium priority)
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

        // Handle single skill removals (lowest priority)
        if (removeTeachingSkill && typeof removeTeachingSkill === 'string') {
            const skill = removeTeachingSkill.trim();
            updatedSkillsToTeach = updatedSkillsToTeach.filter(s => s !== skill);
        }

        if (removeLearningSkill && typeof removeLearningSkill === 'string') {
            const skill = removeLearningSkill.trim();
            updatedSkillsToLearn = updatedSkillsToLearn.filter(s => s !== skill);
        }

        // Build update object
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (avatar !== undefined) updateFields.avatar = avatar;
        
        // Always update skills (even if unchanged, they're validated)
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
    getProfile,
    updateProfile
    // Removed: addTeachingSkill, addLearningSkill, removeTeachingSkill, removeLearningSkill
};