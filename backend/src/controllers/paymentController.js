const stripe = require("../services/stripeService");

const createPaymentIntent = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
        price_data: {
            currency: "usd",
            product_data: { name: "TechSwap Premium Plan" },
            unit_amount: 1000, // $10
        },
        quantity: 1,
        },
        {
        price_data: {
            currency: "usd",
            product_data: { name: "Extra Storage (50GB)" },
            unit_amount: 500, // $5
        },
        quantity: 2, // buying 2 of them
        },
        {
        price_data: {
            currency: "usd",
            product_data: { name: "One-Time Setup Fee" },
            unit_amount: 2000, // $20
        },
        quantity: 1,
        },
        ],
      success_url: "http://localhost:5500/frontend/success.html",
      cancel_url: "http://localhost:5500/frontend/cancel.html",
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPaymentIntent };



