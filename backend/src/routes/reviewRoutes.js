const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware'); 
const {
  createReview,
  getReviewsForUser,
  getReviewsByReviewer,
  getReviewById,
  getAllReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

router.post('/', authMiddleware, createReview); // create review requires auth
router.get('/user/:userId', authMiddleware, getReviewsForUser); // GET /reviews/user/:userId
router.get('/by/:reviewerId', authMiddleware, getReviewsByReviewer); // GET /reviews/by/:reviewerId
router.get('/:id', authMiddleware, getReviewById); // GET /reviews/:id
router.get('/', authMiddleware, getAllReviews); // GET /reviews/ (admin or authenticated)
router.put('/:id', authMiddleware, updateReview); // update review (owner or admin)
router.delete('/:id', authMiddleware, deleteReview); // delete review (owner or admin)

module.exports = router;
