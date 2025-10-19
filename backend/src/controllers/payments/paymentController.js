const stripe = require("../../services/stripeService");
const Wallet = require('../../models/WalletModel');
const Transaction = require('../../models/TranscationModel');
const Session = require('../../models/SessionModel');

// Stripe coin purchase
const createPaymentIntent = async (req, res) => {
  const { coinsNumber, userId } = req.body;
  const dollarValuePerCoin = 0.1;
  const amountInCents = coinsNumber * dollarValuePerCoin * 100;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Purchase ${coinsNumber} Coins` },
            unit_amount: Math.round(amountInCents),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        coinsNumber,
      },
      success_url: "http://localhost:5500/frontend/success.html",
      cancel_url: "http://localhost:5500/frontend/cancel.html",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Session payment (handles both skillExchange and skillTeaching)
const handleSessionPayment = async (req, res) => {
  try {
    const { sessionId, type } = req.body; // type: 'skillExchange' or 'skillTeaching'
    const session = await Session.findById(sessionId).populate('hostId learnerId');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const learnerWallet = await Wallet.findOne({ userId: session.learnerId });
    const teacherWallet = await Wallet.findOne({ userId: session.hostId });
    const platformWallet = await Wallet.findOne({ isPlatform: true });

    if (!learnerWallet || !teacherWallet || !platformWallet)
      return res.status(404).json({ message: 'Wallet(s) missing' });

    if (type === 'skillExchange') {
      if (learnerWallet.balance < 50 || teacherWallet.balance < 50)
        return res.status(400).json({ message: 'Insufficient balance' });

      learnerWallet.balance -= 50;
      teacherWallet.balance -= 50;

      await learnerWallet.save();
      await teacherWallet.save();

      await Transaction.create([
        {
          walletId: learnerWallet._id,
          type: 'debit',
          amount: 50,
          balanceAfter: learnerWallet.balance,
          description: 'Joined skill exchange session',
          sessionId
        },
        {
          walletId: teacherWallet._id,
          type: 'debit',
          amount: 50,
          balanceAfter: teacherWallet.balance,
          description: 'Joined skill exchange session',
          sessionId
        }
      ]);

    } else if (type === 'skillTeaching') {
      if (learnerWallet.balance < 150)
        return res.status(400).json({ message: 'Insufficient balance' });

      learnerWallet.balance -= 150;
      teacherWallet.balance += 50;
      platformWallet.balance += 100;

      await learnerWallet.save();
      await teacherWallet.save();
      await platformWallet.save();

      await Transaction.create([
        {
          walletId: learnerWallet._id,
          type: 'debit',
          amount: 150,
          balanceAfter: learnerWallet.balance,
          description: 'Paid for learning session',
          sessionId,
          toUserId: session.hostId
        },
        {
          walletId: teacherWallet._id,
          type: 'credit',
          amount: 50,
          balanceAfter: teacherWallet.balance,
          description: 'Earned from teaching session',
          sessionId,
          fromUserId: session.learnerId
        },
        {
          walletId: platformWallet._id,
          type: 'credit',
          amount: 100,
          balanceAfter: platformWallet.balance,
          description: 'Platform share from teaching session',
          sessionId,
          fromUserId: session.learnerId,
          platformShare: 100
        }
      ]);
    }

    res.status(200).json({ message: 'Payment handled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

module.exports = {
  createPaymentIntent,
  handleSessionPayment
};
