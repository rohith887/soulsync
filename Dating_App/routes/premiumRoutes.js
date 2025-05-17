const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { Auth } = require('../auth/jwt');
// Premium
router.post('/:userId/subscribe', premiumController.subscribe);
router.post('/:userId/boost-profile', premiumController.boostProfile);

router.get('/premium/history', Auth, premiumController.getPremiumHistory);

module.exports = router;
