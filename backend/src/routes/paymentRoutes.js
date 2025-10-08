const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {createPaymentIntent} = require('../controllers/payments/paymentController');
const router = express.Router();

router.post("/coins/purchase", createPaymentIntent);
// router.post("/payments/coins/purchase",coinPurchaseController);
module.exports = router;
