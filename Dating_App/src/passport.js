const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { googleId: profile.id } });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.displayName,
        phoneNumber: `google_${profile.id}`, // Placeholder, user can update later
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'displayName', 'emails'], // Request email
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ where: { facebookId: profile.id } });
    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        email: profile.emails ? profile.emails[0].value : null,
        firstName: profile.displayName,
        phoneNumber: `facebook_${profile.id}`, // Placeholder, user can update later
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user to session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;







// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const User = require('../models/User');
// require('dotenv').config();

// // Google OAuth Strategy
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: process.env.GOOGLE_CALLBACK_URL,
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ where: { googleId: profile.id } });
//     if (!user) {
//       user = await User.create({
//         googleId: profile.id,
//         email: profile.emails[0].value,
//         firstName: profile.displayName,
//         phoneNumber: `google_${profile.id}`, // Placeholder, user can update later
//       });
//     }
//     return done(null, user);
//   } catch (error) {
//     return done(error, null);
//   }
// }));

// // Facebook OAuth Strategy
// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_CLIENT_ID,
//   clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//   callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//   profileFields: ['id', 'displayName', 'emails'], // Request email
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ where: { facebookId: profile.id } });
//     if (!user) {
//       user = await User.create({
//         facebookId: profile.id,
//         email: profile.emails ? profile.emails[0].value : null,
//         firstName: profile.displayName,
//         phoneNumber: `facebook_${profile.id}`, // Placeholder, user can update later
//       });
//     }
//     return done(null, user);
//   } catch (error) {
//     return done(error, null);
//   }
// }));

// // Serialize user to session
// passport.serializeUser((user, done) => done(null, user.id));

// // Deserialize user from session
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findByPk(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// module.exports = passport;