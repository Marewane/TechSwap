const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getPostById, updatePost } = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Your existing routes
router.post('/', authMiddleware, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', authMiddleware, updatePost);
router.patch('/:id', authMiddleware, updatePost);

module.exports = router;