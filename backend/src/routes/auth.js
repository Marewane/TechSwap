const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');

// Routes → Controllers
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

//@@@@@@@@@@@@@@@@@@@test

const { authMiddleware } = require('../middleware/authMiddleware');

// 🛡️ TEST PROTECTED ROUTE i will delete it in future 
router.get('/profile', authMiddleware, async (req, res) => {
  res.json({
    success: true,
    message: 'Protected route works!',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
