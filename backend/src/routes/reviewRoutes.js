const express = require('express');
const router = express.Router();
const { createReview, getReviewsForUser } = require('../controllers/reviewController');

router.post('/create', createReview);          // POST /reviews/create
router.get('/user/:userId', getReviewsForUser); // GET /reviews/user/:userId

module.exports = router;
