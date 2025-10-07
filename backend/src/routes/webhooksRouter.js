const express = require("express");
const { handleStripeWebhook } = require("../controllers/webhooksController");

const router = express.Router();

//  Use raw body for webhook verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

module.exports = router;
