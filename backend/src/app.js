const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");

const app = express();
<<<<<<< HEAD
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');

// Middleware
=======
app.use(express.json());
>>>>>>> e6e3e707707eef7a61c72a18ee523d765d54217c
app.use(cors());

<<<<<<< HEAD
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
=======
// Register payment routes
app.use("/api/payments", paymentRoutes);
app.use("/",userRoutes);

module.exports = app;
>>>>>>> e6e3e707707eef7a61c72a18ee523d765d54217c
