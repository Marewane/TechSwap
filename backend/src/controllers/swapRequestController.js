// controllers/swapRequestController.js
const SwapRequest = require('../models/SwapRequestModel');
const Post = require('../models/PostModel');
const ChatRoom = require('../models/ChatRoomModel');
const Notification = require('../models/NotificationModel');
const mongoose = require('mongoose');

const createSwapRequest = async (req, res) => {
  try {
    const { postId, scheduledTime, duration } = req.body;
    const requesterId = req.user._id;

    //  DEBUG LOG
    console.log(" Swap request received:", { postId, scheduledTime, duration, requesterId });

    //  Validate required fields
    if (!postId || !scheduledTime || !duration) {
      return res.status(400).json({ message: 'Missing required fields: postId, scheduledTime, duration' });
    }

    //  Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    //  Validate date
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledTime. Use ISO string (e.g., "2025-10-25T12:00:00.000Z")' });
    }

    //  Validate duration
    if (typeof duration !== 'number' || duration <= 0 || duration > 480) {
      return res.status(400).json({ message: 'Duration must be a number between 1 and 480 minutes' });
    }

    //  Fetch post
    const post = await Post.findById(postId);
    if (!post) {
      console.log(" Post not found:", postId);
      return res.status(404).json({ message: 'Post not found.' });
    }

    //  Prevent self-request
    if (post.userId.toString() === requesterId.toString()) {
      console.log(" User tried to request own post:", { userId: requesterId, postId });
      return res.status(400).json({ message: 'You cannot request a swap on your own post.' });
    }

    //  Prevent duplicate
    const exists = await SwapRequest.findOne({ postId, requesterId });
    if (exists) {
      return res.status(400).json({ message: 'You already sent a swap request for this post.' });
    }

    //  Create swap request
    const swapRequest = await SwapRequest.create({
      postId,
      requesterId,
      scheduledTime: scheduledDate,
      duration
    });

    //  Notify post owner
    await Notification.create({
      userId: post.userId,
      type: 'system',
      title: 'New Swap Request',
      content: `You have a new swap request from ${req.user.name}.`,
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    console.log(" Swap request created:", swapRequest._id);
    res.status(201).json(swapRequest);

  } catch (err) {
    console.error(" Swap request error:", err);
    res.status(500).json({ message: 'Server error during swap request' });
  }
};

// Get swap requests for a specific post
const getSwapRequestsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const swapRequests = await SwapRequest.find({ postId })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(swapRequests);
  } catch (err) {
    console.error("Error fetching swap requests:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a swap request
const acceptSwapRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const swapRequest = await SwapRequest.findById(requestId);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user owns the post
    const post = await Post.findById(swapRequest.postId);
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update swap request status
    swapRequest.status = 'accepted';
    await swapRequest.save();

    // Notify requester
    await Notification.create({
      userId: swapRequest.requesterId,
      type: 'swap_accepted',
      title: 'Swap Request Accepted',
      content: 'Your swap request has been accepted!',
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    res.json({ message: 'Swap request accepted', swapRequest });
  } catch (err) {
    console.error("Error accepting swap request:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a swap request
const rejectSwapRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const swapRequest = await SwapRequest.findById(requestId);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user owns the post
    const post = await Post.findById(swapRequest.postId);
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update swap request status
    swapRequest.status = 'rejected';
    await swapRequest.save();

    // Notify requester
    await Notification.create({
      userId: swapRequest.requesterId,
      type: 'swap_rejected',
      title: 'Swap Request Rejected',
      content: 'Your swap request has been rejected.',
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    res.json({ message: 'Swap request rejected', swapRequest });
  } catch (err) {
    console.error("Error rejecting swap request:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSwapRequest,
  acceptSwapRequest,
  rejectSwapRequest,
  getSwapRequestsForPost,
};