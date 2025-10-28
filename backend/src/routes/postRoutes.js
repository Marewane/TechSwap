const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getPostById } = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Your existing routes
router.post('/', authMiddleware, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);

module.exports = router;