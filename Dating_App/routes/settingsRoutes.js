const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const settingsController = require('../controllers/settingsController');
const safetyController = require('../controllers/safetyController');
const notificationController = require('../controllers/notificationController');
const sessionController = require('../controllers/sessionController');
const feedbackController = require('../controllers/feedbackController');
const blockedUserController = require('../controllers/blockedUserController');
//const authenticate = require('../middleware/authenticate');
const { Auth } = require('../auth/jwt');

// 🔐 Change password
router.post('/change-password',Auth, settingsController.changePassword);

// 🧑 Update profile info
router.put('/updateprofile/:userId',Auth,  settingsController.updateProfile);

// 🗑️ Delete account
router.delete('/delete/:userId',Auth,  settingsController.deleteAccount);


router.get('/get', Auth,settingsController.getSettings);
router.put('/update',Auth,settingsController.updateSettings);

router.get('/notifications',Auth,  notificationController.getNotifications);
router.put('/notifications',Auth, notificationController.updateNotifications);
router.post('/notifications/:userId/mark-read',Auth, notificationController.markRead);

router.get('/sessions',Auth,  sessionController.getSessions);
router.delete('/sessions/:sessionId',Auth,  sessionController.logoutSession);

router.post('/feedback',Auth,  feedbackController.submitFeedback);

router.post('/block', Auth, blockedUserController.blockUser);
router.get('/blocked', Auth, blockedUserController.getBlockedUsers);
router.delete('/unblock/:blockedUserId',Auth,  blockedUserController.unblockUser);
router.post('/:userId/report',Auth, safetyController.reportUser);
module.exports = router;
