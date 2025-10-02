const express = require('express');
const app = express();
const cors = require('cors');
const homeRouter = require('./routes/home')

app.use(cors());
app.use(express.json()); // Parse Json Request Body


app.use('/homeTest',homeRouter);


module.exports = app;