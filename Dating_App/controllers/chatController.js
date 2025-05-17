
const { Message, Match, User, Subscription } = require('../models');
const { Op } = require('sequelize');

// 📩 Get chat history between the authenticated user and another user
exports.getChatHistory = async (req, res) => {
  console.log('Authenticated user:', req.user);

  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    // Check if the user is subscribed
    const subscription = await Subscription.findOne({ where: { userId: req.user.id, status: 'active' } });
    const isSubscribed = subscription !== null;

    // Unsubscribed users are limited to 25 messages
    const maxMessages = isSubscribed ? 10000 : 25;

    if (limit > maxMessages) {
      return res.status(400).json({ success: false, message: 'Message limit exceeded. Please subscribe for unlimited messages.' });
    }

    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, targetUserId: userId, status: 'matched' },
          { userId: userId, targetUserId: req.user.id, status: 'matched' },
        ],
      },
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    const messages = await Message.findAll({
      where: {
        matchId: match.id,
        content: { [Op.ne]: '[Deleted]' }, // Exclude deleted messages
      },
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });

    // ✅ Mark received messages as 'seen' and emit read receipt
    await Message.update(
      { status: 'seen' },
      {
        where: {
          senderId: userId,
          receiverId: req.user.id,
          status: { [Op.in]: ['sent', 'delivered'] },
        },
      }
    );

    // Emit read receipt via Socket.IO
    if (global.io) {
      global.io.to(`user_${userId}`).emit('messagesSeen', { from: req.user.id });
    }

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error in getChatHistory:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✉️ Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, content, type } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ success: false, message: 'Receiver ID and content are required.' });
  }

  try {
    // Check subscription status
    const subscription = await Subscription.findOne({ where: { userId: req.user.id, status: 'active' } });
    const isSubscribed = subscription !== null;

    // Unsubscribed users have a limit of 25 messages per week
    if (!isSubscribed) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const messageCount = await Message.count({
        where: {
          senderId: req.user.id,
          createdAt: { [Op.gte]: oneWeekAgo },
          content: { [Op.ne]: '[Deleted]' },
        },
      });

      if (messageCount >= 25) {
        return res.status(400).json({
          success: false,
          message: 'You have reached your weekly message limit of 25. Please subscribe for unlimited messages.',
        });
      }
    }

    // Verify match exists
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, targetUserId: receiverId, status: 'matched' },
          { userId: receiverId, targetUserId: req.user.id, status: 'matched' },
        ],
      },
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      type: type || 'text',
      status: 'sent',
      matchId: match.id,
    });

    // Emit message via Socket.IO
    if (global.io) {
      global.io.to(`user_${receiverId}`).emit('receiveMessage', {
        from: req.user.id,
        to: receiverId,
        content,
        type,
        createdAt: message.createdAt,
        id: message.id,
        matchId: message.matchId,
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Error in sendMessage:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🗑️ Delete a message
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findOne({
      where: { id: messageId, senderId: req.user.id, content: { [Op.ne]: '[Deleted]' } },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or already deleted.' });
    }

    await message.update({ content: '[Deleted]' });

    // Emit deletion event via Socket.IO
    if (global.io) {
      global.io.to(`user_${message.receiverId}`).emit('messageDeleted', { messageId });
    }

    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('Error in deleteMessage:', err);
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
      where: { id: messageId, senderId: req.user.id, content: { [Op.ne]: '[Deleted]' } },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found or already deleted.' });
    }

    // Allow edits only within 5 minutes of sending
    const timeDiff = (new Date() - new Date(message.createdAt)) / 1000 / 60;
    if (timeDiff > 5) {
      return res.status(400).json({ success: false, message: 'Message edit time limit (5 minutes) exceeded.' });
    }

    if (message.type !== 'text') {
      return res.status(400).json({ success: false, message: 'Only text messages can be edited.' });
    }

    const updatedContent = `${content} [Edited]`;
    await message.update({ content: updatedContent });

    // Emit edit event via Socket.IO
    if (global.io) {
      global.io.to(`user_${message.receiverId}`).emit('messageEdited', {
        messageId,
        content: updatedContent,
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Error in editMessage:', err);
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
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, targetUserId: userId, status: 'matched' },
          { userId: userId, targetUserId: req.user.id, status: 'matched' },
        ],
      },
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    const messages = await Message.findAll({
      where: {
        matchId: match.id,
        content: { [Op.like]: `%${query}%`, [Op.ne]: '[Deleted]' },
      },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error in searchMessages:', err);
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
          { targetUserId: req.user.id },
        ],
        status: 'matched',
      },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'username', 'photoUrl'],
        },
        {
          model: User,
          as: 'MatchedUser',
          attributes: ['id', 'username', 'photoUrl'],
        },
      ],
    });

    const chatPreviews = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.userId === req.user.id ? match.MatchedUser : match.User;

        const lastMessage = await Message.findOne({
          where: {
            matchId: match.id,
            content: { [Op.ne]: '[Deleted]' },
          },
          order: [['createdAt', 'DESC']],
        });

        const unreadCount = await Message.count({
          where: {
            senderId: otherUser.id,
            receiverId: req.user.id,
            status: { [Op.in]: ['sent', 'delivered'] },
            content: { [Op.ne]: '[Deleted]' },
          },
        });

        return {
          user: {
            id: otherUser.id,
            username: otherUser.username,
            photoUrl: otherUser.photoUrl,
          },
          lastMessage,
          unreadCount,
        };
      })
    );

    res.json({ success: true, chats: chatPreviews });
  } catch (err) {
    console.error('Error in getRecentChats:', err);
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
          { userId: receiverId, targetUserId: req.user.id, status: 'matched' },
        ],
      },
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
    console.error('Error in sendTypingIndicator:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ➡️ Forward a message
exports.forwardMessage = async (req, res) => {
  const { messageId, receiverId } = req.body;

  if (!messageId || !receiverId) {
    return res.status(400).json({ success: false, message: 'Message ID and receiver ID are required.' });
  }

  try {
    const originalMessage = await Message.findOne({
      where: { id: messageId, content: { [Op.ne]: '[Deleted]' } },
    });

    if (!originalMessage) {
      return res.status(404).json({ success: false, message: 'Original message not found or deleted.' });
    }

    // Check subscription status
    const subscription = await Subscription.findOne({ where: { userId: req.user.id, status: 'active' } });
    const isSubscribed = subscription !== null;

    // Unsubscribed users have a limit of 25 messages per week
    if (!isSubscribed) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const messageCount = await Message.count({
        where: {
          senderId: req.user.id,
          createdAt: { [Op.gte]: oneWeekAgo },
          content: { [Op.ne]: '[Deleted]' },
        },
      });

      if (messageCount >= 25) {
        return res.status(400).json({
          success: false,
          message: 'You have reached your weekly message limit of 25. Please subscribe for unlimited messages.',
        });
      }
    }

    // Verify match exists
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: req.user.id, targetUserId: receiverId, status: 'matched' },
          { userId: receiverId, targetUserId: req.user.id, status: 'matched' },
        ],
      },
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    const forwardedContent = `Forwarded: ${originalMessage.content}`;
    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content: forwardedContent,
      type: originalMessage.type,
      status: 'sent',
      matchId: match.id,
    });

    // Emit forwarded message via Socket.IO
    if (global.io) {
      global.io.to(`user_${receiverId}`).emit('receiveMessage', {
        from: req.user.id,
        to: receiverId,
        content: forwardedContent,
        type: message.type,
        createdAt: message.createdAt,
        id: message.id,
        matchId: match.id,
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Error in forwardMessage:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};







// //const { Chat, Match} = require('../models');
// const Chat = require('../models/Chat'); // Assuming you have a Message model for chat messages
// const Match = require('../models/Match');
// // ðŸ“© Send Message
// exports.sendMessage = async (req, res) => {
//   const { matchId } = req.params;
//   const { sender, receiver, message, media } = req.body;

//   try {
//     // Check if the match exists
//     const match = await Match.findByPk(matchId);
//     if (!match) {
//       return res.status(404).json({ success: false, message: "Match not found" });
//     }

//     // Create chat entry
//     const chat = await Chat.create({
//       matchId,
//       senderId: sender,
//       receiverId: receiver,
//       message,
//       media
//     });

//     res.json({ success: true, message: "Message sent successfully", data: chat });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
//   }
// };

// // ðŸ“œ Retrieve Chat History
// exports.getChatHistory = async (req, res) => {
//   const { matchId } = req.params;

//   try {
//     const messages = await Chat.findAll({
//       where: { matchId },
//       order: [['createdAt', 'ASC']]
//     });

//     res.json({ success: true, data: messages });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching chat history", error: error.message });
//   }
// };

// // ðŸ“¦ Upload Media (placeholder)
// exports.uploadMedia = async (req, res) => {
//   try {
//     // You can implement file handling with multer or similar here later
//     res.json({ success: true, message: "Media upload endpoint hit (not implemented yet)" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Media upload failed", error: error.message });
//   }
// };

