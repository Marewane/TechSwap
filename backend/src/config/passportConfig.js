const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { google, github } = require('./oauthConfig');
const User = require('../models/UserModel');

// 📝 What this does: Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// 📝 What this does: Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 🔵 Google OAuth Strategy
if (google.clientID) {
  passport.use(new GoogleStrategy({
    clientID: google.clientID,
    clientSecret: google.clientSecret,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 📝 Why we do this: Check if user already exists with this Google ID
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // 📝 User exists - log them in
        return done(null, user);
      }

      // 📝 Create new user if doesn't exist
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: 'oauth-user-no-password', // Dummy password for OAuth users
        avatar: profile.photos[0].value,
        status: 'active' // OAuth users are automatically verified
      });

      await user.save();
      done(null, user);

    } catch (error) {
      done(error, null);
    }
  }));
}

// 🐙 GitHub OAuth Strategy  
if (github.clientID) {
  passport.use(new GitHubStrategy({
    clientID: github.clientID,
    clientSecret: github.clientSecret,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // 📝 GitHub may not provide email publicly
      const email = profile.emails?.[0]?.value || `${profile.username}@github.user`;

      let user = await User.findOne({ email });

      if (user) {
        return done(null, user);
      }

      // 📝 Create new user for GitHub
      user = new User({
        name: profile.displayName || profile.username,
        email: email,
        password: 'oauth-user-no-password',
        avatar: profile.photos[0].value,
        status: 'active'
      });

      await user.save();
      done(null, user);

    } catch (error) {
      done(error, null);
    }
  }));
}

module.exports = passport;