const User = require('../models/UserModel');

const getUsers = async (req,res)=>{
    const users = await User.find();
    try {
        res.json({
            data:users
        })
    } catch (error) {
        console.log('error during getUsers : ',error.message)
    }
}

const addUser = async (req,res)=>{
    try {
        const user = req.body;
        const newUser = await User.create(user);
        res.json({
            message:'user has been successfuly added',
            user
        });
    } catch (error) {
        console.log('error during adding new user : ',error.message);
    }
}


module.exports = {addUser,getUsers};