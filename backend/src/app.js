// src/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes'); // Add this

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/users', searchRoutes); // Add this

module.exports = app;