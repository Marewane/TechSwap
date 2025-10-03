const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Register payment routes
app.use("/api/payments", paymentRoutes);
app.use("/",userRoutes);

module.exports = app;
