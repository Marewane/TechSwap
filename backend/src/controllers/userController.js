const User = require('../models/UserModel');
const Wallet = require('../models/WalletModel');

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

// controllers/userController.js

const getMyWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    res.json({ success: true, balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {addUser,getUsers,getMyWallet};