const express = require('express');
const passport = require('../src/passport'); // Adjust path if needed
const userController = require('../controllers/userController');
const { Auth } = require('../auth/jwt');
const router = express.Router();

// Define routes
router.post('/login/otp/request', userController.requestOTP);
router.post('/login/otp/verify', userController.verifyOTP);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.patch('/switch-mode', Auth, userController.switchMode);

// Export the router correctly
module.exports = router;


// // Facebook OAuth routes
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// // Facebook OAuth callback route
// router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res, next) => {
//   // If authentication is successful, call the facebookCallback method
//   try {
//     authController.facebookCallback(req, res, next);
//   } catch (err) {
//     next(err); // Pass any errors to error middleware
//   }
// });


// // Google OAuth routes
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // Google OAuth callback route
// router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res, next) => {
//   // If authentication is successful, call the googleCallback method
//   try {
//     authController.googleCallback(req, res, next);
//   } catch (err) {
//     next(err); // Pass any errors to error middleware
//   }
// });




