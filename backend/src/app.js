const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/',userRouter);
app.use('/api/profile', profileRoutes);

module.exports = app;