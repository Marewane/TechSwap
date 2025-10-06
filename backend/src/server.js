// server.js
const mongoose = require('mongoose');
const app = require('./app'); // imports the express app from app.js

// ---  MongoDB connection string ---
const mongoURI = 'mongodb://127.0.0.1:27017/skillswapDB';
// If you're using MongoDB Atlas, replace with your connection string, like:
// const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/skillswapDB';

// ---  Connect to MongoDB ---
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log(' Connected to MongoDB');

    // ---  Start Express server after DB connection ---
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
  });
