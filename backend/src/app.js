const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require('./routes/userRoutes');
const cors = require("cors");
const matchingRoutes = require('./routes/matchingRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Register payment routes
app.use("/api/payments", paymentRoutes);
app.use("/",userRoutes);
app.use('/api/matches', matchingRoutes);


module.exports = app;
