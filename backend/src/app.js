// src/app.js
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

// Import middlewares
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ⚙️ Stripe webhook route — must be before express.json
app.use("/api/stripe", webHookRouters);
const profileRoutes = require('./routes/profileRoutes');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json()); // Parse Json Request Body


app.use('/',userRouter);


module.exports = app;
