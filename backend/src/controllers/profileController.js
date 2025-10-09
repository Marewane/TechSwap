const User = require('../models/UserModel');

// @desc    Get user profile
// @route   GET /api/profile/view/:userId
// @access  Public (will add auth later)
const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');
        
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

// @desc    Update user profile
// @route   PUT /api/profile/update/:userId
// @access  Public (will add auth later)
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        if(!req.body) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required'
            });
        }


        const { name, bio, avatar, skillsToTeach, skillsToLearn } = req.body;

        // Build update object with only provided fields
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;
        if (avatar !== undefined) updateFields.avatar = avatar;
        if (skillsToTeach !== undefined) updateFields.skillsToTeach = skillsToTeach;
        if (skillsToLearn !== undefined) updateFields.skillsToLearn = skillsToLearn;


        if(Object.keys(updateFields).length == 0){
            return res.status(400).json({
                success: false,
                message: 'No fields to update provided'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validators
            }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
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

// @desc    Add a skill to skillsToTeach
// @route   POST /api/profile/skills/teach/:userId
// @access  Public (will add auth later)
const addTeachingSkill = async (req, res) => {
    try {
        const { userId } = req.params;
        if(!req.body){
            return res.status(400).json({
                success: false,
                message: 'Request body is required'
            }); 
        }   
        const { skill } = req.body;

        if (!skill || skill.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Skill is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if skill already exists
        if (user.skillsToTeach.includes(skill.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Skill already exists in teaching skills'
            });
        }

        // Add skill to array
        user.skillsToTeach.push(skill.trim());
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Teaching skill added successfully',
            data: user
        });
    } catch (error) {
        console.error('Add teaching skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding teaching skill'
        });
    }
};

// @desc    Add a skill to skillsToLearn
// @route   POST /api/profile/skills/learn/:userId
// @access  Public (will add auth later)
const addLearningSkill = async (req, res) => {
    try {
        const { userId } = req.params;
        const { skill } = req.body;

        if (!skill || skill.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Skill is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if skill already exists
        if (user.skillsToLearn.includes(skill.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Skill already exists in learning skills'
            });
        }

        // Add skill to array
        user.skillsToLearn.push(skill.trim());
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Learning skill added successfully',
            data: user
        });
    } catch (error) {
        console.error('Add learning skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding learning skill'
        });
    }
};

// @desc    Remove a skill from skillsToTeach
// @route   DELETE /api/profile/skills/teach/:userId
// @access  Public (will add auth later)
const removeTeachingSkill = async (req, res) => {
    try {
        const { userId } = req.params;
        const { skill } = req.body;

        if (!skill) {
            return res.status(400).json({
                success: false,
                message: 'Skill is required'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $pull: { skillsToTeach: skill }
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teaching skill removed successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Remove teaching skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing teaching skill'
        });
    }
};

// @desc    Remove a skill from skillsToLearn
// @route   DELETE /api/profile/skills/learn/:userId
// @access  Public (will add auth later)
const removeLearningSkill = async (req, res) => {
    try {
        const { userId } = req.params;
        const { skill } = req.body;

        if (!skill) {
            return res.status(400).json({
                success: false,
                message: 'Skill is required'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $pull: { skillsToLearn: skill }
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Learning skill removed successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Remove learning skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing learning skill'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    addTeachingSkill,
    addLearningSkill,
    removeTeachingSkill,
    removeLearningSkill
};