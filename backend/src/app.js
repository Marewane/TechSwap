const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');

app.use(cors());
app.use(express.json()); // Parse Json Request Body


app.use('/',userRouter);


module.exports = app;