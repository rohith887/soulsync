const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const preferenceController = require('../controllers/preferenceController');
//const authenticate = require('../middleware/authenticate');
const { Auth } = require('../auth/jwt');

// Preferences
router.post('/create',Auth,  preferenceController.createPreference);   // Create
router.get('/get',Auth,  preferenceController.getPreference);       // Read
router.put('/update',Auth, preferenceController.updatePreference);    // Update
router.delete('/delete',Auth, preferenceController.deletePreference); // Delete
//router.delete('/preferences', authenticate, settingsController.deletePreference);
module.exports = router;
