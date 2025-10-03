
const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
            done(err,profile)
  }
));

passport.serializeUser( function(user,done){
     done(null,user
})
passport.deserializeUser( function(user,done){
     done(null,user)
})