const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware'); 
const {
  createReview,
  getReviewsForUser,
} = require('../controllers/reviewController');

router.post('/', authMiddleware, createReview); // create review requires auth
router.get('/user/:userId', authMiddleware, getReviewsForUser); // GET /reviews/user/:userId

module.exports = router;
