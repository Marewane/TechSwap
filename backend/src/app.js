const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');

app.use(cors());
app.use(express.json()); // Parse Json Request Body


app.use('/',userRouter);
app.use('/admin',adminRouter);


module.exports = app;