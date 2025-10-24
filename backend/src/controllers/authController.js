const { transformUserResponse } = require('../utils/userTransformer');
const User = require("../models/UserModel");
const passport = require("../config/passportConfig");
const {
  generateVerificationCode,
  sendVerificationEmail,
  generateResetToken,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
} = require('../services/emailService');

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtUtils");

// 📝 STEP 1: INITIAL REGISTRATION (SEND VERIFICATION CODE)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires,
      isEmailVerified: false
    });

    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email',
      data: { userId: user._id, email: user.email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// 📝 STEP 2: VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;

    const user = await User.findOne({
      _id: userId,
      verificationCode,
      verificationCodeExpires: { $gt: new Date() }
    }).select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    const userResponse = transformUserResponse(user);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      data: { user: userResponse, tokens: { accessToken, refreshToken } }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// 📝 STEP 3: RESEND VERIFICATION CODE
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isEmailVerified: false })
      .select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found or already verified'
      });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      data: { userId: user._id, email: user.email }
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification code'
    });
  }
};

// 🔐 LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    const userResponse = transformUserResponse(user);

    return res.json({
      success: true,
      message: "Login successful",
      data: { user: userResponse, tokens: { accessToken, refreshToken } },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// 🔄 REFRESH TOKEN
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const newAccessToken = generateAccessToken(decoded.userId);
    res.json({ success: true, data: { accessToken: newAccessToken } });

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
};

// 🚪 LOGOUT
const logout = (req, res) => {
  return res.json({ success: true, message: "Logout successful" });
};

// 🔵 GOOGLE OAUTH
const googleAuth = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
};

const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
      );
    }

    console.log("Google OAuth success for user:", user.email);

    const isNewUser = info?.isNewUser || user.isNewUser || false;
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    const redirectUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}&isNewUser=${isNewUser}`;

    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  })(req, res, next);
};

// 🐙 GITHUB OAUTH
const githubAuth = (req, res, next) => {
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
};

const githubCallback = (req, res, next) => {
  passport.authenticate("github", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
      );
    }

    console.log("GitHub OAuth success for user:", user.email);

    const isNewUser = info?.isNewUser || user.isNewUser || false;
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    const redirectUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}&isNewUser=${isNewUser}`;

    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  })(req, res, next);
};

// 🔑 FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      });
    }

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// 🔑 RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendPasswordResetConfirmation(user.email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword
};
