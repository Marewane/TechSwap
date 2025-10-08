// Google OAuth Config
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// GitHub OAuth Config  
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

// Validate config
if (!googleClientId || !googleClientSecret) {
  console.warn('Google OAuth credentials missing');
}
if (!githubClientId || !githubClientSecret) {
  console.warn('GitHub OAuth credentials missing');
}

module.exports = {
  google: {
    clientID: googleClientId,
    clientSecret: googleClientSecret
  },
  github: {
    clientID: githubClientId,
    clientSecret: githubClientSecret
  }
};