const { Match, Message, User } = require('../models');
const { Op } = require('sequelize');

// 1️⃣ GET matches for a fake profile
exports.getMatchesForFakeProfile = async (req, res) => {
  const { fakeId } = req.params;

  try {
    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { userId: fakeId },
          { targetUserId: fakeId }
        ],
        status: 'matched'
      },
      include: [
        { model: User, as: 'User', attributes: ['id', 'username', 'firstName', 'photoUrl'] },
        { model: User, as: 'MatchedUser', attributes: ['id', 'username', 'firstName', 'photoUrl'] }
      ]
    });

    const results = matches.map(match => {
      const otherUser = match.userId == fakeId ? match.MatchedUser : match.User;
      return {
        matchId: match.id,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          firstName: otherUser.firstName,
          photoUrl: otherUser.photoUrl
        }
      };
    });

    res.json({ success: true, matches: results });
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2️⃣ GET chat history between fakeId and realUserId
exports.getChatHistory = async (req, res) => {
  const { fakeId, realUserId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: fakeId, receiverId: realUserId },
          { senderId: realUserId, receiverId: fakeId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3️⃣ SEND message as fake profile
exports.sendMessageAsFake = async (req, res) => {
  const { fakeId } = req.params;
  const { receiverId, content, type = 'text' } = req.body;

  try {
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Receiver ID and content are required.' });
    }

    // Check if match exists
    const match = await Match.findOne({
      where: {
        [Op.or]: [
          { userId: fakeId, targetUserId: receiverId },
          { userId: receiverId, targetUserId: fakeId }
        ],
        status: 'matched'
      }
    });

    if (!match) {
      return res.status(400).json({ success: false, message: 'No valid match found.' });
    }

    const message = await Message.create({
      senderId: fakeId,
      receiverId,
      content,
      type,
      status: 'sent'
    });

    // Optionally emit Socket.IO event
    if (global.io) {
      global.io.to(`user_${receiverId}`).emit('receiveMessage', {
        from: fakeId,
        to: receiverId,
        content,
        type,
        createdAt: message.createdAt,
        id: message.id
      });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Error sending message as fake profile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// 🔍 GET chat history between a fake profile and a real user
exports.getChatAsFakeProfile = async (req, res) => {
  const { fakeUserId, targetUserId } = req.params;

  try {
    // Fetch chat messages between fake and target user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: fakeUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: fakeUserId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    // Fetch basic profile info (optional enhancement)
    const [fakeUser, targetUser] = await Promise.all([
      User.findByPk(fakeUserId, {
        attributes: ['id', 'username', 'firstName', 'photoUrl']
      }),
      User.findByPk(targetUserId, {
        attributes: ['id', 'username', 'firstName', 'photoUrl']
      })
    ]);

    res.json({
      success: true,
      participants: {
        fakeUser,
        targetUser
      },
      messages
    });
  } catch (err) {
    console.error('Error in getChatAsFakeProfile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
