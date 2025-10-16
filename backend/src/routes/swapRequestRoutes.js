const express = require('express');
const router = express.Router();
const swapRequestController = require('../controllers/swapRequestController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth.authMiddleware, swapRequestController.createSwapRequest);
router.post('/:id/accept', auth.authMiddleware, swapRequestController.acceptSwapRequest);
router.post('/:id/reject', auth.authMiddleware, swapRequestController.rejectSwapRequest);
router.get('/post/:postId', auth.authMiddleware, swapRequestController.getSwapRequestsForPost);

module.exports = router;