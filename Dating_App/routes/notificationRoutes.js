const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Notifications
router.get('/:userId/get', notificationController.getNotifications);
router.post('/:userId/mark-read', notificationController.markRead);

module.exports = router;
