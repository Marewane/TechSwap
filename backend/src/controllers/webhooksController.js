const stripe = require("../services/stripeService");
const Wallet = require("../models/WalletModel");
const Transaction = require("../models/TransactionModel");
const Notification = require("../models/NotificationModel");
const SwapRequest = require("../models/SwapRequestModel");
const Session = require("../models/SessionModel");
const Post = require("../models/PostModel");
const ChatRoom = require("../models/ChatRoomModel");

// Helper function to create swap session when both parties have paid
const createSessionFromSwapRequest = async (swapRequest) => {
  try {
    const post = await Post.findById(swapRequest.postId);
    
    const session = await Session.create({
      hostId: post.userId,
      learnerId: swapRequest.requesterId,
      createdBy: swapRequest.requesterId,
      scheduledTime: swapRequest.scheduledTime,
      duration: swapRequest.duration,
      title: `Skill Swap: ${post.title}`,
      cost: 50,
      sessionType: 'skillExchange',
      status: 'scheduled',
      swapRequestId: swapRequest._id
    });

    // Create chat room for the session
    await ChatRoom.create({
      participants: [post.userId, swapRequest.requesterId],
      hostId: post.userId,
      learnerId: swapRequest.requesterId,
      postId: post._id,
      swapRequestId: swapRequest._id,
      sessionId: session._id,
      scheduledTime: swapRequest.scheduledTime,
      duration: swapRequest.duration,
      hostPaid: true,
      learnerPaid: true
    });

    // Notify both parties that session is confirmed
    await Notification.create([
      {
        userId: post.userId,
        senderId: swapRequest.requesterId,
        type: 'session',
        title: 'Session Confirmed!',
        content: `Your swap session for "${post.title}" is now confirmed and scheduled for ${swapRequest.scheduledTime.toLocaleString()}.`,
        relatedId: session._id,
        relatedModel: 'Session'
      },
      {
        userId: swapRequest.requesterId,
        senderId: post.userId,
        type: 'session',
        title: 'Session Confirmed!',
        content: `Your swap session for "${post.title}" is now confirmed and scheduled for ${swapRequest.scheduledTime.toLocaleString()}.`,
        relatedId: session._id,
        relatedModel: 'Session'
      }
    ]);

    console.log(`Swap session created: ${session._id}`);
    return session;
  } catch (error) {
    console.error('Error creating swap session:', error);
    throw error;
  }
};

// Auto-validation after coin purchase
const autoValidateAfterCoinPurchase = async (userId, swapRequestId, coinsPurchased) => {
  try {
    console.log(`Attempting auto-validation for user ${userId} after coin purchase`);
    
    const swapRequest = await SwapRequest.findById(swapRequestId).populate('postId');
    if (!swapRequest) {
      console.log('Swap request not found for auto-validation');
      return;
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < 50) {
      console.log('User still does not have enough coins for auto-validation');
      return;
    }

    // User now has enough coins - auto-validate their payment
    const isRequester = userId.equals(swapRequest.requesterId);
    if (isRequester) {
      swapRequest.requesterPaid = true;
    } else {
      swapRequest.ownerPaid = true;
    }
    await swapRequest.save();

    // Deduct coins from wallet
    wallet.balance -= 50;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount: 50,
      balanceAfter: wallet.balance,
      description: 'Auto-validated swap session payment after coin purchase',
      fromUserId: userId,
      swapRequestId: swapRequestId
    });

    // Create notification for the other party
    await Notification.create({
      userId: isRequester ? swapRequest.postId.userId : swapRequest.requesterId,
      senderId: userId,
      type: 'payment',
      title: isRequester ? 'Requester validated payment' : 'Owner validated payment',
      content: isRequester 
        ? 'Requester has validated the payment using coins. Please validate yours to confirm the swap.'
        : 'The post owner has validated the payment using coins. Please validate yours to complete the swap.',
      relatedId: swapRequest._id,
      relatedModel: 'SwapRequest',
    });

    console.log(`Auto-validation successful for user ${userId}`);

    // Check if both parties have paid and create session
    if (swapRequest.requesterPaid && swapRequest.ownerPaid) {
      await createSessionFromSwapRequest(swapRequest);
      console.log('Session created after auto-validation');
    }

  } catch (error) {
    console.error('Auto-validation after coin purchase failed:', error);
  }
};

// Webhook controller
const handleStripeWebhook = async (req, res) => {
  console.log('🔔 WEBHOOK RECEIVED - Body length:', req.body?.length || 'No body');
  console.log('🔔 WEBHOOK Headers - Signature:', req.headers['stripe-signature'] ? 'Present' : 'Missing');
  
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Received Stripe webhook event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log('💰 Session metadata:', session.metadata);
    
    const userId = session.metadata?.userId;
    const coinsNumber = parseInt(session.metadata?.coinsNumber || "0", 10);
    const swapRequestId = session.metadata?.swapRequestId;
    const purpose = session.metadata?.purpose;

    console.log(`💰 Processing payment: User ${userId}, ${coinsNumber} coins`);

    if (!userId) {
      console.error('❌ No user ID in session metadata');
      return res.json({ received: true });
    }

    try {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        {
          $inc: { balance: coinsNumber, totalEarned: coinsNumber },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      console.log(`✅ Credited ${coinsNumber} coins to user ${userId}. New balance: ${wallet.balance}`);

      await Transaction.create({
        walletId: wallet._id,
        type: 'credit',
        amount: coinsNumber,
        balanceAfter: wallet.balance,
        description: `Coin purchase via Stripe - ${coinsNumber} coins`,
        fromUserId: userId
      });

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
        
        if (swapRequestId) {
          await autoValidateAfterCoinPurchase(userId, swapRequestId, coinsNumber);
        }
      }

    } catch (err) {
      console.error("❌ Failed to process webhook:", err.message);
    }
  } else {
    console.log(`ℹ️  Ignoring event type: ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = { handleStripeWebhook };