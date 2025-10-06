const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const sessionRouter = require('./routes/sessionRoutes');
 
app.use(cors());
app.use(express.json()); // Parse Json Request Body


app.use('/',userRouter);
app.use('/sessions', sessionRouter);



module.exports = app;