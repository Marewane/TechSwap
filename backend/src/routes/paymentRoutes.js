const express = require("express");
const stripe = require("../services/stripeService");
const {createPaymentIntent} = require('../controllers/payments/paymentController');
const router = express.Router();

router.post("/coins/purchase", createPaymentIntent);
module.exports = router;
