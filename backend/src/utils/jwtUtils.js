const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, userRole = 'user') => {
  console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET); // Debug log
  return jwt.sign(
    { 
      userId, 
      role: userRole 
    },
    process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET, // Fallback
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (userId, userRole = 'user') => {
  console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET); // Debug log
  return jwt.sign(
    { 
      userId, 
      role: userRole 
    },
    process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET, // Fallback
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Verify access token 
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET);        
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};