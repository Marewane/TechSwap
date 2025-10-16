const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments/paymentController');

const auth = require('../middleware/authMiddleware');

router.post('/buy-coins', auth.authMiddleware, paymentController.createPaymentIntent);
router.post('/session', auth.authMiddleware, paymentController.handleSessionPayment);

module.exports = router;
