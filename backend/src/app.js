const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const cors = require("cors");

const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');

app.use(cors());
app.use(express.json()); // Parse Json Request Body

// Register payment routes
app.use("/api/payments", paymentRoutes);
app.use('/',userRouter);
app.use('/admin',adminRouter);

module.exports = app;
