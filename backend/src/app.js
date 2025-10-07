const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("./config/passportConfig");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoute = require("./routes/adminRoutes");
const sessionRouter = require("./routes/sessionRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const webHookRouters = require("./routes/webhooksRouter");

// Import middlewares
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ⚙️ Stripe webhook route — must be before express.json
app.use("/api/stripe", webHookRouters);

<<<<<<< HEAD
=======

// we use this above of express.json to not convert it to json because the data should be as it is came from stripe for checking signature
app.use('/api/stripe',webHookRouters);


app.use(express.json());
>>>>>>> 9e29cf2683017a24320a81b1b9361e58a38ec964
app.use(cors());
app.use(express.json());
app.use(passport.initialize()); // Enable passport

// Core API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/admin", adminRoute);

// Session & Review routes (from sessions branch)
app.use("/sessions", sessionRouter);
app.use("/reviews", reviewRouter);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TechSwap API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
