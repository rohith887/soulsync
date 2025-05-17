const { Message, Match, User, Subscription, Swipe } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const initChatSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.error('Authentication error: No token provided');
      return next(new Error('Authentication error'));
    }

    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = payload.id;
      next();
    } catch (err) {
      console.error(`Authentication failed for token: ${token}`, err);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} connected`);

    // Mark messages as delivered
    Message.update(
      { status: 'delivered' },
      {
        where: {
          receiverId: userId,
          status: 'sent',
          content: { [Op.ne]: '[Deleted]' },
        },
      }
    ).then(() => {
      io.to(`user_${userId}`).emit('messagesDelivered', { to: userId });
    }).catch((err) => {
      console.error('Error updating delivery status:', err);
    });

    const checkSubscription = async () => {
      const subscription = await Subscription.findOne({ where: { userId } });
      return subscription && subscription.status === 'active';
    };

    socket.on('typing', async ({ to }) => {
      try {
        const match = await Match.findOne({
          where: {
            [Op.or]: [
              { userId, targetUserId: to, status: 'matched' },
              { userId: to, targetUserId: userId, status: 'matched' },
            ],
          },
        });
        if (match) {
          io.to(`user_${to}`).emit('typing', { from: userId });
        }
      } catch (err) {
        console.error('Error in typing:', err);
      }
    });

    socket.on('sendMessage', async ({ to, content, type = 'text' }) => {
      try {
        if (!content) return;

        const isSubscribed = await checkSubscription();
        if (!isSubscribed) {
          const count = await Message.count({
            where: {
              senderId: userId,
              receiverId: to,
              content: { [Op.ne]: '[Deleted]' },
            },
          });
          if (count >= 25) {
            socket.emit('error', { message: 'Message limit reached. Please subscribe.' });
            return;
          }
        }

        const match = await Match.findOne({
          where: {
            [Op.or]: [
              { userId, targetUserId: to, status: 'matched' },
              { userId: to, targetUserId: userId, status: 'matched' },
            ],
          },
        });
        if (!match) return;

        const message = await Message.create({
          senderId: userId,
          receiverId: to,
          content,
          type,
          status: 'sent',
          matchId: match.id,
        });

        io.to(`user_${to}`).emit('receiveMessage', {
          from: userId,
          to,
          content,
          type,
          createdAt: message.createdAt,
          id: message.id,
          matchId: match.id,
        });

        socket.emit('messageSent', { to, messageId: message.id });
      } catch (err) {
        console.error('Error in sendMessage:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('deleteMessage', async ({ messageId }) => {
      try {
        const message = await Message.findOne({
          where: { id: messageId, senderId: userId, content: { [Op.ne]: '[Deleted]' } },
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found or already deleted.' });
          return;
        }

        await message.update({ content: '[Deleted]' });
        io.to(`user_${message.receiverId}`).emit('messageDeleted', { messageId });
      } catch (err) {
        console.error('Error in deleteMessage:', err);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('editMessage', async ({ messageId, content }) => {
      try {
        const message = await Message.findOne({
          where: { id: messageId, senderId: userId, content: { [Op.ne]: '[Deleted]' } },
        });

        if (!message) {
          socket.emit('error', { message: 'Message not found or already deleted.' });
          return;
        }

        const timeDiff = (new Date() - new Date(message.createdAt)) / 1000 / 60;
        if (timeDiff > 5) {
          socket.emit('error', { message: 'Message edit time limit exceeded.' });
          return;
        }

        if (message.type !== 'text') {
          socket.emit('error', { message: 'Only text messages can be edited.' });
          return;
        }

        const updatedContent = `${content} [Edited]`;
        await message.update({ content: updatedContent });

        io.to(`user_${message.receiverId}`).emit('messageEdited', {
          messageId,
          content: updatedContent,
        });
      } catch (err) {
        console.error('Error in editMessage:', err);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    socket.on('forwardMessage', async ({ messageId, to }) => {
      try {
        const originalMessage = await Message.findOne({
          where: { id: messageId, content: { [Op.ne]: '[Deleted]' } },
        });

        if (!originalMessage) {
          socket.emit('error', { message: 'Original message not found or deleted.' });
          return;
        }

        const isSubscribed = await checkSubscription();
        if (!isSubscribed) {
          const count = await Message.count({
            where: {
              senderId: userId,
              receiverId: to,
              content: { [Op.ne]: '[Deleted]' },
            },
          });
          if (count >= 25) {
            socket.emit('error', { message: 'Message limit reached. Please subscribe.' });
            return;
          }
        }

        const match = await Match.findOne({
          where: {
            [Op.or]: [
              { userId, targetUserId: to, status: 'matched' },
              { userId: to, targetUserId: userId, status: 'matched' },
            ],
          },
        });
        if (!match) {
          socket.emit('error', { message: 'No valid match found.' });
          return;
        }

        const message = await Message.create({
          senderId: userId,
          receiverId: to,
          content: `Forwarded: ${originalMessage.content}`,
          type: originalMessage.type,
          status: 'sent',
          matchId: match.id,
        });

        io.to(`user_${to}`).emit('receiveMessage', {
          from: userId,
          to,
          content: message.content,
          type: message.type,
          createdAt: message.createdAt,
          id: message.id,
          matchId: match.id,
        });

        socket.emit('messageSent', { to, messageId: message.id });
      } catch (err) {
        console.error('Error in forwardMessage:', err);
        socket.emit('error', { message: 'Failed to forward message' });
      }
    });

    socket.on('swipe', async ({ targetUserId, liked, isSuperSwipe }) => {
      try {
        const isSubscribed = await checkSubscription();
        if (!isSubscribed) {
          const today = new Date().toISOString().split('T')[0];
          const count = await Swipe.count({
            where: {
              userId,
              createdAt: { [Op.gte]: today },
            },
          });

          if (count >= 5) {
            socket.emit('error', { message: 'Daily swipe limit exceeded. Subscribe for more.' });
            return;
          }
        }

        await Swipe.create({
          userId,
          targetUserId,
          liked,
          isSuperSwipe,
        });

        if (liked) {
          const reverse = await Swipe.findOne({
            where: {
              userId: targetUserId,
              targetUserId: userId,
              liked: true,
            },
          });

          if (reverse) {
            const match = await Match.create({
              userId,
              targetUserId,
              status: 'matched',
            });

            io.to(`user_${userId}`).emit('match', { matchId: match.id, targetUserId });
            io.to(`user_${targetUserId}`).emit('match', { matchId: match.id, userId });
          }
        }
      } catch (err) {
        console.error('Error in swipe:', err);
        socket.emit('error', { message: 'Swipe failed' });
      }
    });

    socket.on('disconnect', async () => {
      try {
        await User.update({ lastSeen: new Date() }, { where: { id: userId } });
        console.log(`❌ User ${userId} disconnected`);
      } catch (err) {
        console.error('Error in disconnect:', err);
      }
    });
  });
};

module.exports = { initChatSocket };
