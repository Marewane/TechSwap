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
    const userId = req.user._id;

    // Find or create a wallet for this user with sensible defaults
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          currency: 'USD',
          isPlatform: false
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, balance: wallet.balance });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {addUser,getUsers,getMyWallet};