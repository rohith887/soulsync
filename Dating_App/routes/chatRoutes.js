const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const adminChatController = require('../chat/adminChatController');
const { Auth } = require('../auth/jwt');

router.get('/history/:userId', Auth, chatController.getChatHistory);
router.post('/send', Auth, chatController.sendMessage);
router.delete('/message/:messageId',Auth, chatController.deleteMessage);
router.put('/message/:messageId', Auth, chatController.editMessage);
router.get('/search/:userId',Auth, chatController.searchMessages);
router.get('/recent', Auth, chatController.getRecentChats);
router.post('/typing', Auth, chatController.sendTypingIndicator);
router.post('/forward', Auth, chatController.forwardMessage);

//
router.get('/:fakeId/matches', Auth, adminChatController.getMatchesForFakeProfile);
router.get('/:fakeId/chats/:realUserId', adminChatController.getChatHistory);
router.get('/:fakeUserId/:targetUserId', Auth,  adminChatController.getChatAsFakeProfile);
router.post('/:fakeUserId/send', Auth,  adminChatController.sendMessageAsFake);

module.exports = router;

// router.post('/chat/:fakeUserId/send', Auth, isAdmin, adminChatController.sendMessageAsFakeProfile);

