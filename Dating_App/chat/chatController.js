const { Message, Match, User, Subscription } = require('../models');
const { Op } = require('sequelize');

// 📩 Get chat history between the authenticated user and another user
exports.getChatHistory = async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    // Check if the user is subscribed
    const isSubscribed = await Subscription.findOne({ where: { userId: req.user.id, status: 'active' } });

    // Unsubscribed users are limited to 25 messages
    const maxMessages = isSubscribed ? 10000 : 25;

    if (limit > maxMessages) {
      return res.status(400).json({ success: false, message: 'Message limit exceeded. Please subscribe for unlimited messages.' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id }
        ],
        status: { [Op.ne]: 'deleted' } // Exclude deleted messages
      },
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    // ✅ Mark received messages as 'seen' and emit read receipt
    await Message.update(
      { status: 'seen' },
      {
        where: {
          senderId: userId,
          receiverId: req.user.id,
          status: { [Op.ne]: 'seen' }
        }
      }
    );

    // Emit read receipt via Socket.IO (assuming io is passed or accessible)
    if (global.io) {
      global.io.to(`user_${userId}`).emit('messagesSeen', { from: req.user.id });
    }

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✉️ Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, content, type, mediaUrl } = req.body;

  if (!receiverId || (!content && !mediaUrl)) {
    return res.status(400).json({ success: false, message: 'Receiver ID and message content or media URL are required.' });
  }

  try {
    // Check subscription status
    const subscription = await Subscription.findOne({ where: { userId: req.user.id } });
    const isSubscribed = subscription && subscription.status === 'active';

    // Unsubscribed users have a limit of 25 messages
    const messageCount = await Message.count({
      where: { senderId: req.user.id, receiverId, status: { [Op.ne]: 'deleted' } }
    });

    if (!isSubscribed && messageCount >= 25) {
      return res.status(400).json({ success: false, message: 'You have reached your message limit. Please subscribe for unlimited messages.' });
    }

    // Verify match exists
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, targetUserId: receiverId, status: 'matched' },
          { userId: receiverId, targetUserId: req.user.id, status: 'matched' }
        ]
      }
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      type: type || 'text',
      media: mediaUrl || null,
      status: 'sent'
    });

    // Emit message via Socket.IO (assuming io is passed or accessible)
    if (global.io) {
      global.io.to(`user_${receiverId}`).emit('receiveMessage', {
        from: req.user.id,
        to: receiverId,
        content,
        type,
        media: mediaUrl,
        createdAt: message.createdAt,
        id: message.id
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🗑️ Delete a message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findOne({
      where: { id: messageId, senderId: req.user.id, status: { [Op.ne]: 'deleted' } }
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or already deleted.' });
    }

    await message.update({ status: 'deleted', content: '[Deleted]' });

    // Emit deletion event via Socket.IO
    if (global.io) {
      global.io.to(`user_${message.receiverId}`).emit('messageDeleted', { messageId });
    }

    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✍️ Edit a message
exports.editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'New content is required.' });
  }

  try {
    const message = await Message.findOne({
      where: { id: messageId, senderId: req.user.id, status: { [Op.ne]: 'deleted' } }
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or already deleted.' });
    }

    // Allow edits only within 5 minutes of sending
    const timeDiff = (new Date() - new Date(message.createdAt)) / 1000 / 60;
    if (timeDiff > 5) {
      return res.status(400).json({ success: false, message: 'Message edit time limit (5 minutes) exceeded.' });
    }

    await message.update({ content, edited: true });

    // Emit edit event via Socket.IO
    if (global.io) {
      global.io.to(`user_${message.receiverId}`).emit('messageEdited', {
        messageId,
        content,
        edited: true
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔍 Search messages
exports.searchMessages = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Search query is required.' });
  }

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: userId },
          { senderId: userId, receiverId: req.user.id }
        ],
        content: { [Op.like]: `%${query}%` },
        status: { [Op.ne]: 'deleted' }
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 💬 Get recent chat list (matches with latest message and unread count)
exports.getRecentChats = async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { targetUserId: req.user.id }
        ],
        status: 'matched'
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'photoUrl']
        },
        {
          model: User,
          as: 'MatchedUser',
          attributes: ['id', 'username', 'photoUrl']
        }
      ]
    });

    const chatPreviews = await Promise.all(matches.map(async match => {
      const otherUser =
        match.userId === req.user.id ? match.MatchedUser : match.User;

      const lastMessage = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: req.user.id, receiverId: otherUser.id },
            { senderId: otherUser.id, receiverId: req.user.id }
          ],
          status: { [Op.ne]: 'deleted' }
        },
        order: [['createdAt', 'DESC']]
      });

      const unreadCount = await Message.count({
        where: {
          senderId: otherUser.id,
          receiverId: req.user.id,
          status: { [Op.ne]: 'seen' }
        }
      });

      return {
        user: {
          id: otherUser.id,
          username: otherUser.username,
          photoUrl: otherUser.photoUrl
        },
        lastMessage,
        unreadCount
      };
    }));

    res.json({ success: true, chats: chatPreviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ⌨️ Trigger typing indicator
exports.sendTypingIndicator = async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ success: false, message: 'Receiver ID is required.' });
  }

  try {
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, targetUserId: receiverId, status: 'matched' },
          { userId: receiverId, targetUserId: req.user.id, status: 'matched' }
        ]
      }
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    // Emit typing indicator via Socket.IO
    if (global.io) {
      global.io.to(`user_${receiverId}`).emit('typing', { from: req.user.id });
    }

    res.json({ success: true, message: 'Typing indicator sent.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};