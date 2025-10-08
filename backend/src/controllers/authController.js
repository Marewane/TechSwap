const User = require("../models/UserModel");

const passport = require("../config/passportConfig");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtUtils");

// 📝 REGISTER
const register = async (req, res) => {
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
    const userResponse = await User.findById(user._id).select("-password");

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: userResponse, tokens: { accessToken, refreshToken } },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// 🔐 LOGIN
const login = async (req, res) => {
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
      data: { accessToken: newAccessToken },
    });
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
  // In a real app, you might blacklist the token here
  // For now, we'll just return success - client should delete tokens
  //the real work will be handled by front end❌❌❌
  return res.json({
    success: true,
    message: "Logout successful",
  });
};

// 🔵 GOOGLE OAUTH - Initiate authentication
const googleAuth = (req, res, next) => {
  // 📝 What this does: Redirects user to Google's login page
  passport.authenticate("google", {
    scope: ["profile", "email"], // 📝 What we're asking permission for
  })(req, res, next);
};

// 🔵 GOOGLE OAUTH - Callback handler

// const googleCallback = (req, res, next) => {
//   passport.authenticate("google", { session: false }, (err, user) => {
//     if (err || !user) {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/login?error=oauth_failed`
//       );
//     }

//     // 📝 Generate JWT tokens for the OAuth user
//     const accessToken = generateAccessToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);

//     // 📝 Redirect to frontend with tokens
//     res.redirect(
//       `${process.env.FRONTEND_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
//     );
//   })(req, res, next);
// };


const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      // 📝 Also change the error to show in browser
      return res.send(`
        <html>
          <body>
            <h2>OAuth Failed!</h2>
            <p>Error: ${err ? err.message : 'User not found'}</p>
          </body>
        </html>
      `);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 📝 TEMPORARY: Show tokens in browser instead of redirecting
    res.send(`
      <html>
        <body>
          <h2>OAuth Success! 🎉</h2>
          <p><strong>User:</strong> ${user.name} (${user.email})</p>
          <p><strong>Access Token:</strong> ${accessToken}</p>
          <p><strong>Refresh Token:</strong> ${refreshToken}</p>
          <script>
            console.log('OAuth Success!', {
              user: '${user.name}',
              email: '${user.email}', 
              accessToken: '${accessToken}',
              refreshToken: '${refreshToken}'
            });
          </script>
        </body>
      </html>
    `);
  })(req, res, next);
};

// 🐙 GITHUB OAUTH - Initiate authentication
const githubAuth = (req, res, next) => {
  passport.authenticate("github", {
    scope: ["user:email"], // 📝 GitHub specific scope for email access
  })(req, res, next);
};

// 🐙 GITHUB OAUTH - Callback handler
// const githubCallback = (req, res, next) => {
//   passport.authenticate("github", { session: false }, (err, user) => {
//     if (err || !user) {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/login?error=oauth_failed`
//       );
//     }

//     const accessToken = generateAccessToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);

//     res.redirect(
//       `${process.env.FRONTEND_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
//     );
//   })(req, res, next);
// };

// this is just for test 
const githubCallback = (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user) => {
    if (err || !user) {
      // 📝 Show error in browser
      return res.send(`
        <html>
          <body>
            <h2>GitHub OAuth Failed!</h2>
            <p>Error: ${err ? err.message : 'User not found'}</p>
          </body>
        </html>
      `);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 📝 TEMPORARY: Show tokens in browser instead of redirecting
    res.send(`
      <html>
        <body>
          <h2>GitHub OAuth Success! 🎉</h2>
          <p><strong>User:</strong> ${user.name} (${user.email})</p>
          <p><strong>Access Token:</strong> ${accessToken}</p>
          <p><strong>Refresh Token:</strong> ${refreshToken}</p>
          <script>
            console.log('GitHub OAuth Success!', {
              user: '${user.name}',
              email: '${user.email}', 
              accessToken: '${accessToken}',
              refreshToken: '${refreshToken}'
            });
          </script>
        </body>
      </html>
    `);
  })(req, res, next);
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
};
