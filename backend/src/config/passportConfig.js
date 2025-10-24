const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { google, github } = require('./oauthConfig');
const User = require('../models/UserModel');

// 🧠 Serialize user: store user ID in session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// 🧠 Deserialize user: retrieve user from DB using stored ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

//
// 🔵 GOOGLE OAUTH STRATEGY
//
if (google.clientID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: google.clientID,
        clientSecret: google.clientSecret,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });

          // ✅ Check if the user already exists
          if (user) {
            // Existing user
            return done(null, user, { isNewUser: false });
          }

          // 🆕 Create a new user
          user = new User({
            name: profile.displayName,
            email,
            password: 'oauth-user-no-password',
            avatar: profile.photos[0].value,
            status: 'active',
          });

          await user.save();

          // ✅ Here we pass `isNewUser` as true
          return done(null, user, { isNewUser: true });
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

//
// 🐙 GITHUB OAUTH STRATEGY
//
if (github.clientID) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: github.clientID,
        clientSecret: github.clientSecret,
        callbackURL: "/api/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails?.[0]?.value || `${profile.username}@github.user`;

          let user = await User.findOne({ email });

          if (user) {
            return done(null, user, { isNewUser: false });
          }

          // 🆕 Create new GitHub user
          user = new User({
            name: profile.displayName || profile.username,
            email,
            password: 'oauth-user-no-password',
            avatar: profile.photos?.[0]?.value,
            status: 'active',
          });

          await user.save();

          // ✅ Mark as new user
          return done(null, user, { isNewUser: true });
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
