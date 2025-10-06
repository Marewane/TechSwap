const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtUtils");

// 📝 REGISTER ENDPOINT
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    //create new user
    const user = new User({
      name,
      email,
      password, // This will be automatically hashed by your pre-save middleware
    });
    await user.save();

    //generate token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 🔒 SECURITY: Fetch user data again but EXCLUDE the password field
    // Why? The original 'user' object still contains the hashed password
    // We never want to send password (even hashed) to the client
    const userResponse = await User.findById(user._id).select("-password"); // '-password' mean give me all except the password

    return res.status(201).json({
      success: true,
      message: "User registred successfully",
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// 🔐 LOGIN ENDPOINT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // ⚡Find user and include password (since we have select: false in schema)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Return user data without password
    const userResponse = await User.findById(user._id).select("-password");
    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// 🔄 REFRESH TOKEN ENDPOINT
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
});

// 🚪 LOGOUT ENDPOINT
router.post("/logout", (req, res) => {
  // In a real app, you might blacklist the token here
  // For now, we'll just return success - client should delete tokens
  //the real work will be handled by front end❌❌❌
  return res.json({
    success: true,
    message: "Logout successful",
  });
});

//@@@@@@@@@@@@@@@@@@@test

// const { authMiddleware } = require('../middleware/authMiddleware');

// // 🛡️ TEST PROTECTED ROUTE i will delete it in future
// router.get('/profile', authMiddleware, async (req, res) => {
//   res.json({
//     success: true,
//     message: 'Protected route works!',
//     data: {
//       user: req.user
//     }
//   });
// });

module.exports = router;
