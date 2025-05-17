const express = require('express');
const passport = require('../src/passport'); // Adjust path if needed
const userProfileController = require('../controllers/userProfileController');
const { Auth } = require('../auth/jwt');
const router = express.Router();


router.get('/getprofiles', Auth , userProfileController.getProfile);
router.put('/updateprofile', Auth , userProfileController.updateProfile);
router.delete('/profile/photo/:id', Auth, userProfileController.deletePhoto);
router.post('/profile/photo', Auth, userProfileController.uploadPhoto);
router.put('/profile/prompt-response', Auth, userProfileController.updatePromptResponse);
router.put   ('/profile/location',     Auth, userProfileController.updateLocation);
router.delete('/account',              Auth, userProfileController.deleteAccount);

module.exports = router;

//