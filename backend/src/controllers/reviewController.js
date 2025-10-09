const Review = require('../models/ReviewModel');
const Session = require('../models/SessionModel');
const User = require('../models/UserModel');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    // reviewer is taken from authenticated user (authMiddleware should set req.user)
    const reviewerId = req.user && req.user.id ? req.user.id : null;
    const { sessionId, reviewedUserId, rating, comment } = req.body;

    if (!reviewerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!sessionId || !reviewedUserId || !rating) {
      return res.status(400).json({ error: 'sessionId, reviewedUserId and rating are required' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only participants may submit a review for the session
    const sessionParticipants = [
      session.hostId && session.hostId.toString ? session.hostId.toString() : String(session.hostId),
      session.learnerId && session.learnerId.toString ? session.learnerId.toString() : String(session.learnerId),
    ];
    if (!sessionParticipants.includes(String(reviewerId))) {
      return res.status(403).json({ error: 'Only participants of the session can submit a review for it' });
    }

    // Ensure session is completed before allowing a review (adjust status name if you use different enum)
    if (session.status && session.status.toString().toLowerCase() !== 'completed') {
      return res.status(400).json({ error: 'Reviews can only be created for completed sessions' });
    }

    // Ensure reviewed user is a participant of the same session
    if (!sessionParticipants.includes(String(reviewedUserId))) {
      return res.status(400).json({ error: 'The reviewed user must be a participant in the session' });
    }

    // Prevent reviewing yourself
    if (String(reviewerId) === String(reviewedUserId)) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    // Create review (unique index on sessionId+reviewerId prevents duplicates)
    const review = await Review.create({
      sessionId,
      reviewerId,
      reviewedUserId,
      rating,
      comment,
    });

    // Update reviewed user's aggregated rating and review count (best-effort; adapt field names if different)
    try {
      const user = await User.findById(reviewedUserId);
      if (user) {
        const prevCount = user.reviewCount ? Number(user.reviewCount) : 0;
        const prevAvg = user.averageRating ? Number(user.averageRating) : 0;
        const newCount = prevCount + 1;
        const newAvg = ((prevAvg * prevCount) + Number(rating)) / newCount;

        user.reviewCount = newCount;
        user.averageRating = Math.round(newAvg * 100) / 100; // round to 2 decimals
        await user.save();
      }
    } catch (aggErr) {
      // Swallow aggregation errors so review creation doesn't fail; but log for ops
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
