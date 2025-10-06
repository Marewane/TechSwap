// ✅ SECURE - throws error if secret is missing
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Validate that secrets exist
if (!accessTokenSecret) {
  throw new Error('ACCESS_TOKEN_SECRET environment variable is required');
}
if (!refreshTokenSecret) {
  throw new Error('REFRESH_TOKEN_SECRET environment variable is required');
}

module.exports = {
  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiry: '1m',
  refreshTokenExpiry: '1m'
};