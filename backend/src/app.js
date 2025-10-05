const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json()); // Parse Json Request Body

app.get('/',(req,res)=>{
    res.send("<a href='/auth/google'>authentification</a>")
})

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});



// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});


module.exports = app;