const express = require("express");
const cors = require('cors');
require('dotenv').config();
const passport = require('./config/passportConfig'); 


// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoute = require('./routes/adminRoutes');

// Import middlewares
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Add this for JSON parsing

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/admin',adminRoute);
app.use(passport.initialize()); // Add this line


// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'TechSwap API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middlewares (LAST)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
