const stripe = require("../../services/stripeService");

const createPaymentIntent = async (req, res) => {
  const { coinsNumber, userId } = req.body;

  // 1 coin = $0.10
  const dollarValuePerCoin = 0.1;
  const amountInCents = coinsNumber * dollarValuePerCoin * 100; // Stripe wants cents

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Purchase ${coinsNumber} Coins` },
            unit_amount: Math.round(amountInCents), // ensure integer value
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,      // attach user id
        coinsNumber, // attach purchased coins
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

module.exports = { createPaymentIntent };
