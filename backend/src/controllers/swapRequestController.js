// controllers/swapRequestController.js
const SwapRequest = require('../models/SwapRequestModel');
const Post = require('../models/PostModel');
const ChatRoom = require('../models/ChatRoomModel');
const Notification = require('../models/NotificationModel');
const mongoose = require('mongoose');
const stripe = require('../services/stripeService');
const User = require('../models/UserModel');
const Wallet = require('../models/WalletModel');
const Transaction = require('../models/TransactionModel');
const Session = require('../models/SessionModel');

// Helper: Create session and chat when both parties have paid
const createSessionFromSwapRequest = async (swapRequest) => {
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

  await Notification.create([
    {
      userId: post.userId,
      type: 'session',
      title: 'Session Confirmed!',
      content: `Your swap session for "${post.title}" is now confirmed and scheduled for ${swapRequest.scheduledTime.toLocaleString()}.`,
      relatedId: session._id,
      relatedModel: 'Session'
    },
    {
      userId: swapRequest.requesterId,
      type: 'session',
      title: 'Session Confirmed!',
      content: `Your swap session for "${post.title}" is now confirmed and scheduled for ${swapRequest.scheduledTime.toLocaleString()}.`,
      relatedId: session._id,
      relatedModel: 'Session'
    }
  ]);

  return session;
};

const createSwapRequest = async (req, res) => {
  try {
    const { postId, scheduledTime, duration } = req.body;
    const requesterId = req.user._id;

    // DEBUG LOG
    console.log(" Swap request received:", { postId, scheduledTime, duration, requesterId });

    // Validate required fields
    if (!postId || !scheduledTime || !duration) {
      return res.status(400).json({ message: 'Missing required fields: postId, scheduledTime, duration' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // Validate date
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledTime. Use ISO string (e.g., "2025-10-25T12:00:00.000Z")' });
    }

    // Validate duration
    if (typeof duration !== 'number' || duration <= 0 || duration > 480) {
      return res.status(400).json({ message: 'Duration must be a number between 1 and 480 minutes' });
    }

    // Fetch post
    const post = await Post.findById(postId);
    if (!post) {
      console.log(" Post not found:", postId);
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Prevent self-request
    if (post.userId.toString() === requesterId.toString()) {
      console.log(" User tried to request own post:", { userId: requesterId, postId });
      return res.status(400).json({ message: 'You cannot request a swap on your own post.' });
    }

    // Prevent duplicate
    const exists = await SwapRequest.findOne({ postId, requesterId });
    if (exists) {
      return res.status(400).json({ message: 'You already sent a swap request for this post.' });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      postId,
      requesterId,
      scheduledTime: scheduledDate,
      duration
    });

    // Notify post owner
    await Notification.create({
      userId: post.userId,
      senderId: req.user._id,
      type: 'swap_request',
      title: 'New Swap Request',
      content: `You have a new swap request from ${req.user.name}.`,
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    console.log(" Swap request created:", swapRequest._id);
    res.status(201).json(swapRequest);

  } catch (err) {
    console.error(" Swap request error:", err);
    res.status(500).json({ message: 'Server error during swap request' });
  }
};

// Get swap requests for a specific post
const getSwapRequestsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const swapRequests = await SwapRequest.find({ postId })
      .populate('requesterId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(swapRequests);
  } catch (err) {
    console.error("Error fetching swap requests:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept a swap request
const acceptSwapRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const swapRequest = await SwapRequest.findById(id).populate('postId');
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user owns the post
    const post = await Post.findById(swapRequest.postId);
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update swap request status
    swapRequest.status = 'accepted';
    await swapRequest.save();

    // ENRICHED NOTIFICATION: Include post title, skills, and owner name
    await Notification.create({
      userId: swapRequest.requesterId,
      senderId: req.user._id, // post owner
      type: 'swap_accepted',
      title: `Swap Accepted: "${post.title}"`,
      content: `Your request to swap "${post.skillsWanted?.join(', ') || 'skills'}" for "${post.skillsOffered?.join(', ') || 'skills'}" has been accepted by ${req.user.name}.`,
      relatedId: swapRequest._id,
      relatedModel: 'SwapRequest'
    });

    res.json({ message: 'Swap request accepted', swapRequest });
  } catch (err) {
    console.error("Error accepting swap request:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a swap request
const rejectSwapRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const swapRequest = await SwapRequest.findById(requestId);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check if user owns the post
    const post = await Post.findById(swapRequest.postId);
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update swap request status
    swapRequest.status = 'rejected';
    await swapRequest.save();

    // Notify requester
    await Notification.create({
      userId: swapRequest.requesterId,
      senderId: req.user._id,
      type: 'swap_rejected',
      title: 'Swap Request Rejected',
      content: 'Your swap request has been rejected.',
      relatedId: swapRequest._id,
      relatedModel: 'Post'
    });

    res.json({ message: 'Swap request rejected', swapRequest });
  } catch (err) {
    console.error("Error rejecting swap request:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Original payment validation (for backward compatibility)
const validatePayment = async (req, res) => {
  try {
    const { id } = req.params; // swap request ID
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id).populate('postId');
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // determine who is paying
    const isRequester = userId.equals(swapRequest.requesterId);
    const isOwner = userId.equals(swapRequest.postId.userId);

    if (!isRequester && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to pay for this request' });
    }

    // Check user's wallet balance
    const wallet = await Wallet.findOne({ userId });
    const hasEnoughCoins = wallet && wallet.balance >= 50;

    if (hasEnoughCoins) {
      // ✅ User has enough coins - deduct from wallet
      wallet.balance -= 50;
      await wallet.save();

      // Update swapRequest payment status
      if (isRequester) swapRequest.requesterPaid = true;
      if (isOwner) swapRequest.ownerPaid = true;
      await swapRequest.save();

      // Create transaction record
      await Transaction.create({
        walletId: wallet._id,
        type: 'debit',
        amount: 50,
        balanceAfter: wallet.balance,
        description: `Skill swap session payment - ${isRequester ? 'Requester' : 'Owner'}`,
        fromUserId: userId,
        sessionId: null // Will be updated when session is created
      });

      // Create notification for the other party
      if (isRequester) {
        await Notification.create({
          userId: swapRequest.postId.userId,
          senderId: userId,
          type: 'payment',
          title: 'Requester validated payment',
          content: 'Requester has validated the payment using wallet coins. Please validate yours to confirm the swap.',
          relatedId: swapRequest._id,
          relatedModel: 'SwapRequest',
        });
      } else if (isOwner) {
        await Notification.create({
          userId: swapRequest.requesterId,
          senderId: userId,
          type: 'payment',
          title: 'Owner validated payment',
          content: 'The post owner has validated the payment using wallet coins. Please validate yours to complete the swap.',
          relatedId: swapRequest._id,
          relatedModel: 'SwapRequest',
        });
      }

      // Check if both parties have paid and create session
      let session = null;
      if (swapRequest.requesterPaid && swapRequest.ownerPaid) {
        session = await createSessionFromSwapRequest(swapRequest);
        
        // Update transactions with session ID
        await Transaction.updateMany(
          { 
            $or: [
              { fromUserId: swapRequest.requesterId },
              { fromUserId: swapRequest.postId.userId }
            ],
            description: /skill swap session payment/
          },
          { sessionId: session._id }
        );
      }

      return res.json({ 
        success: true,
        paymentMethod: 'wallet',
        message: 'Payment validated successfully using wallet coins',
        newBalance: wallet.balance,
        sessionCreated: !!session,
        session: session ? { _id: session._id } : null
      });

    } else {
      // ❌ User doesn't have enough coins - redirect to Stripe for coin purchase
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { 
                name: 'TechSwap Coins Purchase',
                description: `Purchase coins to validate your swap session (Need 50 coins, you have ${wallet?.balance || 0})`
              },
              unit_amount: 1000, // $10 for 100 coins
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId.toString(),
          coinsNumber: 100, // Give 100 coins for $10
          purpose: 'swap_validation',
          swapRequestId: swapRequest._id.toString(),
          payerType: isRequester ? 'requester' : 'owner'
        },
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-cancel`,
      });

      return res.json({ 
        success: false,
        paymentMethod: 'stripe',
        message: 'Insufficient coins. Redirecting to purchase coins.',
        url: session.url,
        currentBalance: wallet?.balance || 0,
        requiredBalance: 50
      });
    }

  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process payment', 
      error: error.message 
    });
  }
};

// Check wallet balance before payment
const checkWalletBalance = async (req, res) => {
  try {
    const { id } = req.params; // swap request ID
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id).populate('postId');
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    //  Find or create wallet for user (using same logic as webhook)
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { 
          balance: 0, 
          totalEarned: 0, 
          totalSpent: 0, 
          currency: 'USD', 
          isPlatform: false 
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const requiredCoins = 50;
    const hasSufficientCoins = wallet.balance >= requiredCoins;

    // Get swap details for the modal
    const swapDetails = {
      title: swapRequest.postId.title,
      duration: swapRequest.duration,
      scheduledTime: swapRequest.scheduledTime
    };

    res.json({
      hasSufficientCoins,
      currentBalance: wallet.balance,
      requiredCoins,
      swapDetails
    });

  } catch (error) {
    console.error('Wallet balance check error:', error);
    res.status(500).json({ message: 'Failed to check wallet balance', error: error.message });
  }
};

// Process payment using coins
const validateCoinPayment = async (req, res) => {
  try {
    const { id } = req.params; // swap request ID
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id).populate('postId');
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Check wallet balance again (in case it changed)
    const wallet = await Wallet.findOne({ userId });
    const requiredCoins = 50;
    
    if (!wallet || wallet.balance < requiredCoins) {
      return res.status(400).json({ 
        message: `Insufficient coins. Required: ${requiredCoins}, Available: ${wallet?.balance || 0}` 
      });
    }

    // Deduct coins from wallet
    wallet.balance -= requiredCoins;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount: requiredCoins,
      balanceAfter: wallet.balance,
      description: 'Swap session validation payment',
      fromUserId: userId,
      swapRequestId: id
    });

    // Update swap request payment status
    const isRequester = userId.equals(swapRequest.requesterId);
    if (isRequester) {
      swapRequest.requesterPaid = true;
    } else {
      swapRequest.ownerPaid = true;
    }
    await swapRequest.save();

    // Create notification
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

    // Check if both parties have paid and create session
    let session = null;
    if (swapRequest.requesterPaid && swapRequest.ownerPaid) {
      session = await createSessionFromSwapRequest(swapRequest);
    }

    res.json({ 
      message: 'Payment validated successfully', 
      coinsDeducted: requiredCoins,
      newBalance: wallet.balance,
      sessionCreated: !!session
    });

  } catch (error) {
    console.error('Coin payment validation error:', error);
    res.status(500).json({ message: 'Failed to validate payment', error: error.message });
  }
};

// Stripe payment for coin purchase
// Stripe payment for coin purchase
// In your swapRequestController.js, update the createStripePaymentForCoins function:

// Stripe payment for coin purchase - UPDATED to return to notifications
const createStripePaymentForCoins = async (req, res) => {
  try {
    const { id } = req.params;
    const { requiredCoins } = req.body;
    const userId = req.user._id;

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    // Ensure user has a wallet
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { 
          balance: 0, 
          totalEarned: 0, 
          totalSpent: 0, 
          currency: 'USD', 
          isPlatform: false 
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const coinsToPurchase = requiredCoins;
    const amountInCents = Math.ceil(coinsToPurchase * 0.1 * 100); // $0.10 per coin

    console.log(`Creating Stripe session for ${coinsToPurchase} coins ($${(amountInCents / 100).toFixed(2)})`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { 
              name: 'TechSwap Coins Purchase',
              description: `Purchase ${coinsToPurchase} coins for swap session validation`
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        coinsNumber: coinsToPurchase.toString(),
        swapRequestId: id.toString(),
        purpose: 'swap_validation'
      },
      // UPDATED: Return to notifications page instead of payment success page
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/notifications?payment_success=true&coins=${coinsToPurchase}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/notifications?payment_cancelled=true`,
    });

    console.log(`Stripe session created: ${session.id} for ${coinsToPurchase} coins`);

    res.json({ 
      id: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe payment session error:', error);
    res.status(500).json({ message: 'Failed to create payment session', error: error.message });
  }
};




module.exports = {
  createSwapRequest,
  acceptSwapRequest,
  rejectSwapRequest,
  getSwapRequestsForPost,
  validatePayment,
  checkWalletBalance,
  validateCoinPayment,
  createStripePaymentForCoins
};