const jwt = require('jsonwebtoken');
const {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry,
  refreshTokenExpiry,
} = require('../config/jwtConfig');

const generateAccessToken = (userId, userRole = 'user') => {
  return jwt.sign(
    {
      userId,
      role: userRole,
    },
    process.env.JWT_ACCESS_SECRET || accessTokenSecret,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || accessTokenExpiry }
  );
};

const generateRefreshToken = (userId, userRole = 'user') => {
  return jwt.sign(
    {
      userId,
      role: userRole,
    },
    process.env.JWT_REFRESH_SECRET || refreshTokenSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || refreshTokenExpiry }
  );
};

// Verify access token 
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || accessTokenSecret);
  } catch (error) {
    return null;
  }
}

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || refreshTokenSecret);        
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