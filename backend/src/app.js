const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cors = require("cors");

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json()); // Parse Json Request Body

// Register payment routes
app.use("/api/payments", paymentRoutes);
app.use('/',userRoutes);
app.use('/admin',adminRoutes);

module.exports = app;
