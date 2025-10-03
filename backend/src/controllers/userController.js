const User = require('../models/UserModel');

const getUsers = async (req,res)=>{
    const users = await User.find();
    res.json({
        data:users
    })
}

const addUser = async (req,res)=>{
    const user = req.body;
    const newUser = await User.create(user);
    res.json({
        message:'user has been successfuly added',
        user
    })
}


module.exports = {addUser,getUsers};