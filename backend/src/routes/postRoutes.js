const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getPostById } = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');

// TEST ROUTE - Check if auth middleware works
router.get('/test-auth', authMiddleware, (req, res) => {
  console.log('🔍 TEST ROUTE - req.user:', req.user);
  res.json({
    success: true,
    message: 'Auth is working!',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Your existing routes
router.post('/', authMiddleware, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);

module.exports = router;