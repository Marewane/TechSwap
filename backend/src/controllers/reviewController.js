const mongoose = require('mongoose');
const Review = require('../models/ReviewModel');
const Session = require('../models/SessionModel');
const User = require('../models/UserModel');

// Create a new review
const createReview = async (req, res) => {
  try {
    const reviewerId = (req.user && (req.user.id || req.user._id)) ? String(req.user.id || req.user._id) : null;
    const { sessionId, reviewedUserId, rating, comment } = req.body;

    if (!reviewerId) return res.status(401).json({ error: 'Authentication required' });
    if (!sessionId || !reviewedUserId || rating == null) {
      return res.status(400).json({ error: 'sessionId, reviewedUserId and rating are required' });
    }

    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const session = await Session.findById(sessionId).select('hostId learnerId status');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const participants = [
      session.hostId ? String(session.hostId) : null,
      session.learnerId ? String(session.learnerId) : null,
    ].filter(Boolean);

    if (!participants.includes(String(reviewerId))) {
      return res.status(403).json({ error: 'Only session participants can submit a review for it' });
    }

    const status = (session.status || '').toString().toLowerCase();
    if (!(status === 'completed' || status === 'finished' || status === 'closed')) {
      return res.status(400).json({ error: 'Reviews can only be created for completed sessions' });
    }

    if (!participants.includes(String(reviewedUserId))) {
      return res.status(400).json({ error: 'The reviewed user must be a participant in the session' });
    }
    if (String(reviewerId) === String(reviewedUserId)) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    const review = await Review.create({
      sessionId: mongoose.Types.ObjectId(sessionId),
      reviewerId: mongoose.Types.ObjectId(reviewerId),
      reviewedUserId: mongoose.Types.ObjectId(reviewedUserId),
      rating: r,
      comment,
    });

    // Recompute aggregates for reviewed user
    try {
      const agg = await Review.aggregate([
        { $match: { reviewedUserId: mongoose.Types.ObjectId(reviewedUserId) } },
        { $group: { _id: '$reviewedUserId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (agg && agg.length) {
        const { avgRating, count } = agg[0];
        await User.findByIdAndUpdate(reviewedUserId, {
          $set: { averageRating: Math.round(avgRating * 100) / 100, reviewCount: count }
        });
      }
    } catch (aggErr) {
      console.error('Failed to update user rating aggregation:', aggErr);
    }

    return res.status(201).json({ message: 'Review created', data: review });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'A review from this user for this session already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get all reviews for a specific reviewed user
const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewedUserId: userId })
      .populate('reviewerId', 'name email')
      .populate('sessionId', 'title scheduledTime');

    res.json({ data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews written by a reviewer
const getReviewsByReviewer = async (req, res) => {
  try {
    const { reviewerId } = req.params;
    const reviews = await Review.find({ reviewerId })
      .populate('reviewedUserId', 'name email')
      .populate('sessionId', 'title scheduledTime');
    res.json({ data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single review by id
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id)
      .populate('reviewerId', 'name email')
      .populate('reviewedUserId', 'name email')
      .populate('sessionId', 'title scheduledTime');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews (protected)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewerId', 'name email')
      .populate('reviewedUserId', 'name email')
      .populate('sessionId', 'title scheduledTime');
    res.json({ data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update a review (only owner or admin)
const updateReview = async (req, res) => {
  try {
    const userId = (req.user && (req.user.id || req.user._id)) ? String(req.user.id || req.user._id) : null;
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const isOwner = String(review.reviewerId) === String(userId);
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin); // flexible check
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized to update this review' });

    if (rating != null) {
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }
      review.rating = r;
    }
    if (comment != null) review.comment = comment;

    await review.save();

    // Recompute aggregates for reviewed user
    try {
      const reviewedUserId = String(review.reviewedUserId);
      const agg = await Review.aggregate([
        { $match: { reviewedUserId: mongoose.Types.ObjectId(reviewedUserId) } },
        { $group: { _id: '$reviewedUserId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (agg && agg.length) {
        const { avgRating, count } = agg[0];
        await User.findByIdAndUpdate(reviewedUserId, {
          $set: { averageRating: Math.round(avgRating * 100) / 100, reviewCount: count }
        });
      }
    } catch (aggErr) {
      console.error('Failed to update user rating aggregation:', aggErr);
    }

    res.json({ message: 'Review updated', data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Delete a review (only owner or admin)
const deleteReview = async (req, res) => {
  try {
    const userId = (req.user && (req.user.id || req.user._id)) ? String(req.user.id || req.user._id) : null;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const isOwner = String(review.reviewerId) === String(userId);
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.isAdmin);
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized to delete this review' });

   await Review.findByIdAndDelete(id);


    // Recompute aggregates for reviewed user
    try {
      const reviewedUserId = String(review.reviewedUserId);
      const agg = await Review.aggregate([
        { $match: { reviewedUserId: mongoose.Types.ObjectId(reviewedUserId) } },
        { $group: { _id: '$reviewedUserId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (agg && agg.length) {
        const { avgRating, count } = agg[0];
        await User.findByIdAndUpdate(reviewedUserId, {
          $set: { averageRating: Math.round(avgRating * 100) / 100, reviewCount: count }
        });
      } else {
        // no reviews left
        await User.findByIdAndUpdate(reviewedUserId, { $set: { averageRating: 0, reviewCount: 0 } });
      }
    } catch (aggErr) {
      console.error('Failed to update user rating aggregation:', aggErr);
    }

    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

module.exports = {
  createReview,
  getReviewsForUser,
  getReviewsByReviewer,
  getReviewById,
  getAllReviews,
  updateReview,
  deleteReview,
};