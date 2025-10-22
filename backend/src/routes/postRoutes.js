const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

// router.use(auth.authMiddleware);

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

module.exports = router;