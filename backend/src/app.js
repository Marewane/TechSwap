const express = require("express");
const cors = require('cors');
require('dotenv').config();
const passport = require('./config/passportConfig'); 


// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');


// Import middlewares
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
const webHookRouters = require("./routes/webhooksRouter");
const cors = require("cors");

// we use this above of express.json to not convert it to json because the data should be as it is came from stripe for checking signature
app.use('/api/stripe',webHookRouters);


app.use(express.json());
app.use(cors());
app.use(express.json()); // Add this for JSON parsing

// Routes
app.use('/api/auth', authRoutes);

app.use('/',userRouter);


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