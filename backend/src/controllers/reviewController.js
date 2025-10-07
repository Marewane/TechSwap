const Review = require('../models/ReviewModel');

// Create a new review
const createReview = async (req, res) => {
  try {
    const { sessionId, reviewerId, reviewedUserId, rating, comment } = req.body;

    if (!sessionId || !reviewerId || !reviewedUserId || !rating) {
      return res.status(400).json({ error: 'sessionId, reviewerId, reviewedUserId, and rating are required' });
    }

    // Create and save the review
    const review = await Review.create({ sessionId, reviewerId, reviewedUserId, rating, comment });

    res.status(201).json({ message: 'Review created successfully', data: review });
  } catch (error) {
    // Handle duplicate review (unique index)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already reviewed this session' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews for a specific user (host or learner)
const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewedUserId: userId })
      .populate('reviewerId', 'name')
      .populate('sessionId', 'title scheduledTime');

    res.json({ data: reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createReview, getReviewsForUser };
