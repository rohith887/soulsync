const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { Auth } = require('../auth/jwt');
const multer = require('multer');

// 🔁 Swipe (like/dislike)
router.post('/swipe/:userId',Auth, matchController.swipe);
router.get('/:userId/suggestions', Auth,matchController.getMatchSuggestions);
router.post('/super-swipe',Auth, matchController.superSwipe);
router.post('/check-match',Auth, matchController.checkMatch);
router.post('/first-message',Auth, matchController.sendFirstMessage);
router.post('/opening-move',Auth, matchController.setOpeningMove);
router.post('/respond-opening',Auth, matchController.respondOpeningMove);
router.get('/beeline',Auth, matchController.getBeeline);

router.post('/location/update', Auth, matchController.updateLocation);
router.get('/location/discover', Auth, matchController.discoverUsers);
router.get('/filters', Auth, matchController.getFilters);
router.post('/filters/apply', Auth, matchController.applyFilters);
router.get('/likes-sent', Auth, matchController.likesSent);
router.get('/likes-received', Auth, matchController.likesReceived);
router.get('/matches', Auth, matchController.getMatches);
router.delete('/match/:matchId', Auth, matchController.unmatchUser);
router.get('/search', Auth, matchController.searchUsers);
router.get('/swipes/history', Auth, matchController.getSwipeHistory);
router.get('/profile-visits', Auth, matchController.getProfileVisits);


module.exports = router;
