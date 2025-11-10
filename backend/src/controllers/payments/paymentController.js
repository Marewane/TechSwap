const stripe = require("../../services/stripeService");
const Wallet = require('../../models/WalletModel');
const Transaction = require('../../models/TransactionModel');
const Session = require('../../models/SessionModel');
const ChatRoom = require('../../models/ChatRoomModel');
const Notification = require('../../models/NotificationModel');
const { broadcastNotifications } = require('../../utils/notificationEmitter');

const createPaymentIntent = async (req, res) => {
  try {
    const { coinsNumber } = req.body || {};
    const authenticatedUserId = req.user?._id;
    const parsedCoins = Number(coinsNumber);

    if (!authenticatedUserId) {
      return res.status(401).json({ error: "User authentication required" });
    }

    if (!parsedCoins || parsedCoins <= 0) {
      return res.status(400).json({ error: "coinsNumber must be a positive number" });
    }

    const dollarValuePerCoin = 0.1;
    const amountInCents = Math.round(parsedCoins * dollarValuePerCoin * 100);
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Purchase ${parsedCoins} Coins` },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: authenticatedUserId.toString(),
        coinsNumber: parsedCoins,
        purpose: "wallet_topup",
      },
      success_url: `${frontendBase}/profile?payment_success=true&coins=${parsedCoins}`,
      cancel_url: `${frontendBase}/profile?payment_cancelled=true`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

const handleSessionPayment = async (req, res) => {
  try {
    const { chatRoomId } = req.body;
    const userId = req.user._id;

    const chatRoom = await ChatRoom.findById(chatRoomId)
      .populate('hostId', 'name')
      .populate('learnerId', 'name')
      .populate('postId', 'title');

    if (!chatRoom) return res.status(404).json({ message: 'Chat room not found' });

    const isHost = userId.equals(chatRoom.hostId._id);
    const isLearner = userId.equals(chatRoom.learnerId._id);

    if (!isHost && !isLearner) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < 50) {
      return res.status(400).json({ message: 'Insufficient balance (50 coins required)' });
    }

    wallet.balance -= 50;
    await wallet.save();

    if (isHost) chatRoom.hostPaid = true;
    if (isLearner) chatRoom.learnerPaid = true;
    await chatRoom.save();

    await Transaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount: 50,
      balanceAfter: wallet.balance,
      description: 'Joined skill exchange session',
      fromUserId: userId
    });

    let session = null;
    if (chatRoom.hostPaid && chatRoom.learnerPaid) {
      session = await Session.create({
        hostId: chatRoom.hostId._id,
        learnerId: chatRoom.learnerId._id,
        createdBy: userId,
        scheduledTime: chatRoom.scheduledTime,
        duration: chatRoom.duration,
        title: `Skill Swap: ${chatRoom.postId.title}`,
        cost: 50,
        sessionType: 'skillExchange',
        status: 'scheduled'
      });

      chatRoom.sessionId = session._id;
      await chatRoom.save();

      await Transaction.updateMany(
        { walletId: wallet._id, description: 'Joined skill exchange session' },
        { sessionId: session._id }
      );

      const notifications = await Notification.create([
        {
          userId: chatRoom.hostId._id,
          type: 'session',
          title: 'Session Confirmed!',
          content: 'Your swap session is now confirmed. You can start it at the scheduled time.',
          relatedId: session._id,
          relatedModel: 'Session'
        },
        {
          userId: chatRoom.learnerId._id,
          type: 'session',
          title: 'Session Confirmed!',
          content: 'Your swap session is now confirmed. You can start it at the scheduled time.',
          relatedId: session._id,
          relatedModel: 'Session'
        }
      ]);

      await broadcastNotifications(notifications);
    }

    res.status(200).json({
      message: 'Payment validated',
      sessionCreated: !!session,
      session: session ? {
        _id: session._id,
        scheduledTime: session.scheduledTime,
        duration: session.duration
      } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed', error: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  handleSessionPayment
};