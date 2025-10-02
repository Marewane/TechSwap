const User = require('../models/UserModel');

const getUsers = async (req,res)=>{
    const users = await User.find();
    res.json({
        data:users
    })
}

const addUser = async (req,res)=>{
    const {name,email} = req.body;
    const user = await User.create({name,email});
    res.json({
        message:'user has been successfuly added',
        user:{
            name,
            email
        }
    })
}


module.exports = {addUser,getUsers};