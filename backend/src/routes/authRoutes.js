const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes → Controllers
// Local authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);


// 🔵 Google OAuth routes
router.get('/google', authController.googleAuth); // Starts Google OAuth flow
router.get('/google/callback', authController.googleCallback); // Google redirects here after login


// 🐙 GitHub OAuth routes  
router.get('/github', authController.githubAuth); // Starts GitHub OAuth flow
router.get('/github/callback', authController.githubCallback); // GitHub redirects here after login






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


// Google OAuth:

// http://localhost:5000/api/auth/google


// GitHub OAuth:

// http://localhost:5000/api/auth/github