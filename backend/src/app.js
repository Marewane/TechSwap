const express = require('express');
const app = express();
const cors = require('cors');
const homeRouter = require('./routes/home')
const userRouter = require('./routes/userRoutes');

app.use(cors());
app.use(express.json()); // Parse Json Request Body


app.use('/homeTest',homeRouter);
app.use('/',userRouter);


module.exports = app;