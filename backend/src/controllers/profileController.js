const mongoose = require('mongoose');
const User = require('../models/UserModel');
const Review = require('../models/ReviewModel');
const Post = require('../models/PostModel');
// Sessions feature removed from profile response
const Transaction = require('../models/TransactionModel');

// =====================================================
// @desc   Get OWN profile
// @route  GET /api/profile/me
// @access Private
// =====================================================
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      'name email role avatar bio skillsToLearn skillsToTeach rating totalSession lastLogin isEmailVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get related data (sessions removed)
    const [posts, transactions] = await Promise.all([
      Post.find({ userId })
        .select('title content skillsOffered skillsWanted availability createdAt')
        .populate({ path: 'userId', select: 'name avatar rating' }),
      Transaction.find({ userId }).select('amount status type createdAt')
    ]);

    // Compute wallet balance from transactions (completed only)
    const balance = transactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => {
        const amt = Number(tx.amount) || 0;
        return sum + (tx.type === 'credit' ? amt : -amt);
      }, 0);

    res.status(200).json({
      success: true,
      data: {
        user,
        posts,
        wallet: { balance },
        transactions,
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

// =====================================================
// @desc   Get ANOTHER user's profile
// @route  GET /api/profile/:userId
// @access Public (or Private)
// =====================================================
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findById(userId).select(
      'name avatar bio skillsToLearn skillsToTeach rating totalSession createdAt'
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // For public profiles, only show published posts (sessions removed)
    const [posts] = await Promise.all([
      Post.find({ userId })
        .select('title content skillsOffered skillsWanted availability createdAt')
        .populate({ path: 'userId', select: 'name avatar rating' })
    ]);

    // Check if the viewer is the owner
    const isOwner = req.user && req.user._id.toString() === userId;

    res.status(200).json({
      success: true,
      data: {
        user,
        posts,
        isOwner
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user profile' 
    });
  }
};

// =====================================================
// @desc   Update OWN profile
// @route  PUT /api/profile/me
// @access Private
// =====================================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
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

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data provided for update'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Clone current skills
    let updatedTeach = [...user.skillsToTeach];
    let updatedLearn = [...user.skillsToLearn];

    // Handle complete array replacement with validation
    if (skillsToTeach !== undefined) {
      if (!Array.isArray(skillsToTeach)) {
        return res.status(400).json({
          success: false,
          message: 'skillsToTeach must be an array'
        });
      }
      updatedTeach = [...new Set(skillsToTeach.map(skill => skill.trim()).filter(skill => skill))];
    }

    if (skillsToLearn !== undefined) {
      if (!Array.isArray(skillsToLearn)) {
        return res.status(400).json({
          success: false,
          message: 'skillsToLearn must be an array'
        });
      }
      updatedLearn = [...new Set(skillsToLearn.map(skill => skill.trim()).filter(skill => skill))];
    }

    // Handle individual skill operations with validation
    if (addTeachingSkill) {
      const skill = addTeachingSkill.trim();
      if (skill && !updatedTeach.includes(skill)) {
        updatedTeach.push(skill);
      }
    }

    if (addLearningSkill) {
      const skill = addLearningSkill.trim();
      if (skill && !updatedLearn.includes(skill)) {
        updatedLearn.push(skill);
      }
    }

    if (removeTeachingSkill) {
      const skill = removeTeachingSkill.trim();
      updatedTeach = updatedTeach.filter(s => s !== skill);
    }

    if (removeLearningSkill) {
      const skill = removeLearningSkill.trim();
      updatedLearn = updatedLearn.filter(s => s !== skill);
    }

    // Remove duplicates and empty values
    updatedTeach = [...new Set(updatedTeach.filter(skill => skill))];
    updatedLearn = [...new Set(updatedLearn.filter(skill => skill))];

    // Build update object only with provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatar !== undefined) updateData.avatar = avatar.trim();
    
    updateData.skillsToTeach = updatedTeach;
    updateData.skillsToLearn = updatedLearn;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('name email avatar bio skillsToTeach skillsToLearn rating totalSession createdAt');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors
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