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
const matchingRoutes = require('./routes/matchingRoutes');
const searchRoutes = require('./routes/searchRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');
const swapRequestRoutes = require('./routes/swapRequestRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Import middlewares
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const sessionPaymentRoutes = require('./routes/sessionPaymentRoutes');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Stripe webhook route — must be before express.json
app.use("/api/stripe", webHookRouters);

// Middleware
app.use(passport.initialize());

// Core API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/admin", adminRoute);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);

// Session & Review routes
app.use("/api/sessions", sessionRouter);
app.use("/api/reviews", reviewRouter);

app.use('/api/users', searchRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/swap-requests', swapRequestRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/session-payment', sessionPaymentRoutes);

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