const stripe = require("../services/stripeService");
const Wallet = require("../models/WalletModel");
const Transaction = require("../models/TransactionModel");
const Notification = require("../models/NotificationModel");

// Webhook controller
const handleStripeWebhook = async (req, res) => {
  console.log('🔔 WEBHOOK RECEIVED - Body length:', req.body?.length || 'No body');
  console.log('🔔 WEBHOOK Headers - Signature:', req.headers['stripe-signature'] ? 'Present' : 'Missing');
  console.log('🔔 WEBHOOK Headers - Content-Type:', req.headers['content-type']);
  
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (not parsed JSON)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Received Stripe webhook event: ${event.type}`);

  // When payment is successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log('💰 Session metadata:', session.metadata);
    console.log('💰 Payment status:', session.payment_status);
    console.log('💰 Session ID:', session.id);
    
    const userId = session.metadata?.userId;
    const coinsNumber = parseInt(session.metadata?.coinsNumber || "0", 10);
    const swapRequestId = session.metadata?.swapRequestId;
    const purpose = session.metadata?.purpose;

    console.log(`💰 Processing payment: User ${userId}, ${coinsNumber} coins`);

    if (!userId) {
      console.error('❌ No user ID in session metadata');
      return res.json({ received: true }); // Still return 200 to Stripe
    }

    try {
      // ✅ UPDATE: Get or create wallet and get the wallet document
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: coinsNumber, totalEarned: coinsNumber },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      console.log(`✅ Credited ${coinsNumber} coins to user ${userId}. New balance: ${wallet.balance}`);

      // ✅ ADD: Create transaction record
      const transaction = await Transaction.create({
        walletId: wallet._id,
        type: 'credit',
        amount: coinsNumber,
        balanceAfter: wallet.balance,
        description: `Coin purchase via Stripe - ${coinsNumber} coins`,
        fromUserId: userId
      });

      console.log(`✅ Created transaction record: ${transaction._id}`);

      // ✅ ADD: Create notification for user (optional)
      if (purpose === 'swap_validation') {
        await Notification.create({
          userId: userId,
          type: 'payment',
          title: 'Coins Purchased Successfully!',
          content: `Your account has been credited with ${coinsNumber} coins. You can now validate your swap session.`,
          relatedId: swapRequestId || null,
          relatedModel: swapRequestId ? 'SwapRequest' : 'Wallet'
        });
        
        console.log(`✅ Created notification for user ${userId} about coin purchase`);
      }

    } catch (err) {
      console.error("❌ Failed to process webhook:", err.message);
      console.error("❌ Error details:", err);
    }
  } else {
    console.log(`ℹ️  Ignoring event type: ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };