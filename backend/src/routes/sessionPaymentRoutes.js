const express = require('express');
const router = express.Router();
const {handleSessionPayment} = require('../controllers/payments/paymentController');
router.post('/',handleSessionPayment);
module.exports = router;