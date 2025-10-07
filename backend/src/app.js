const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const sessionRouter = require('./routes/sessionRoutes');
const reviewRouter = require('./routes/reviewRoutes');

 
app.use(cors());
app.use(express.json()); 


app.use('/',userRouter);
app.use('/sessions', sessionRouter);

app.use('/reviews', reviewRouter);


module.exports = app;