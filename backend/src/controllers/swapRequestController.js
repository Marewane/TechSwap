const SwapRequest = require('../models/SwapRequestModel');
const Post = require('../models/PostModel');
const ChatRoom = require('../models/ChatRoomModel');
const Notification = require('../models/NotifactionModel');
const mongoose = require('mongoose');

const createSwapRequest = async (req, res) => {
  try {
    const { postId } = req.body;
    const requesterId = req.user._id;

    // Fetch the post
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Prevent user from requesting their own post
    if (post.userId.toString() === requesterId.toString()) {
      return res.status(400).json({ message: 'You cannot request a swap on your own post.' });
    }

    // Prevent duplicate requests
    const exists = await SwapRequest.findOne({ postId, requesterId });
    if (exists) return res.status(400).json({ message: 'Already requested.' });

    const swapRequest = await SwapRequest.create({ postId, requesterId });

    // Notify post owner
    await Notification.create({
      userId: post.userId, // the owner of the post
      type: 'system',
      title: 'New Swap Request',
      content: `You have a new swap request from ${req.user.username}.`,
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    res.status(201).json(swapRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptSwapRequest = async (req, res) => {
  try {
    const { id } = req.params; // swapRequestId
    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) return res.status(404).json({ message: 'Swap request not found.' });

    // Only post owner can accept
    const post = await Post.findById(swapRequest.postId);
    if (!post.userId.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' });

    swapRequest.status = 'accepted';
    await swapRequest.save();

    // Update post status
    post.status = 'accepted';
    await post.save();

    // Create chat room
    const chatRoom = await ChatRoom.create({
      participants: [post.userId, swapRequest.requesterId],
      hostId: post.userId,           // post owner
      learnerId: swapRequest.requesterId, // requester
      postId: post._id,
      swapRequestId: swapRequest._id,
    });

    // Notify requester
    await Notification.create({
      userId: swapRequest.requesterId,
      type: 'system', // must match Notification model enum
      title: 'Swap Accepted',
      content: `Your swap request for post "${post.title}" has been accepted.`,
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    res.json({ swapRequest, chatRoom });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectSwapRequest = async (req, res) => {
  try {
    const { id } = req.params; // swapRequestId
    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) return res.status(404).json({ message: 'Swap request not found.' });

    // Only post owner can reject
    const post = await Post.findById(swapRequest.postId);
    if (!post.userId.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden.' });

    swapRequest.status = 'rejected';
    await swapRequest.save();

    // Notify requester
    await Notification.create({
      userId: swapRequest.requesterId,
      type: 'system', // must match Notification model enum
      title: 'Swap Rejected',
      content: `Your swap request for post "${post.title}" was rejected.`,
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    res.json({ swapRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSwapRequestsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const requests = await SwapRequest.find({ postId })
      .populate('requesterId', 'username skillsToTeach skillsToLearn');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSwapRequest,
  acceptSwapRequest,
  rejectSwapRequest,
  getSwapRequestsForPost,
};
