const stripe = require("../services/stripeService");
const Wallet = require("../models/WalletModel");

// Webhook controller
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (not parsed JSON)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // When payment is successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata?.userId;
    const coinsNumber = parseInt(session.metadata?.coinsNumber || "0", 10);

    try {
      // Update user's wallet balance
      await Wallet.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: coinsNumber, totalEarned: coinsNumber },
        },
        { new: true, upsert: true }
      );

      console.log(`Credited ${coinsNumber} coins to user ${userId}`);
    } catch (err) {
      console.error("Failed to update wallet:", err.message);
    }
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };
