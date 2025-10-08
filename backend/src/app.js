const express = require("express");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require('./routes/userRoutes');
const webHookRouters = require("./routes/webhooksRouter");
const cors = require("cors");
const sessionPaymentRoutes = require('./routes/sessionPaymentRoutes');
const app = express();
// we use this above of express.json to not convert it to json because the data should be as it is came from stripe for checking signature
app.use('/api/stripe',webHookRouters);


app.use(express.json());
app.use(cors());

// Register payment routes
app.use("/api/payments", paymentRoutes);
app.use("/",userRoutes);
app.use('/api/session-payment',sessionPaymentRoutes);
module.exports = app;
