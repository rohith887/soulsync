const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');

// Safety
router.post('/:userId/report', safetyController.reportUser);
router.post('/:userId/block', safetyController.blockUser);

module.exports = router;
