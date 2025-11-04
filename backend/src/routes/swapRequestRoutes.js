const express = require('express');
const router = express.Router();
const swapRequestController = require('../controllers/swapRequestController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth.authMiddleware, swapRequestController.createSwapRequest);
router.put('/:id/accept', auth.authMiddleware, swapRequestController.acceptSwapRequest);
router.put('/:requestId/reject', auth.authMiddleware, swapRequestController.rejectSwapRequest);
router.get('/post/:postId', auth.authMiddleware, swapRequestController.getSwapRequestsForPost);
router.post('/:id/validate-payment', auth.authMiddleware, swapRequestController.validatePayment);
router.get('/:id/wallet-check', auth.authMiddleware, swapRequestController.checkWalletBalance);
router.post('/:id/validate-coin-payment', auth.authMiddleware, swapRequestController.validateCoinPayment);
router.post('/:id/stripe-payment', auth.authMiddleware, swapRequestController.createStripePaymentForCoins);

module.exports = router;