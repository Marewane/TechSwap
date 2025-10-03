const express = require('express');
const app = express();
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const passport = require('passport');

require('./auth/google/auth')

app.use(cors());
app.use(express.json()); // Parse Json Request Body

app.get('/',(req,res)=>{
    res.send("<a href='/auth/google'>authentification</a>")
})

app.get('/auth/google',
    passport.authenticate('google',{scope:['email','profile']})
)

app.get('/protected',(req,res)=>{
    res.send("hello");
})
app.use('/',userRouter);


module.exports = app;