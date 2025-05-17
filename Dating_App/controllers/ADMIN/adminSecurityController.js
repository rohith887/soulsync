// adminSecurityController.js

const BlockedUser = require('../../models/BlockedUser');
const User = require('../../models/User');

module.exports = {
  blockUser: async (req, res) => {
    const { userId, blockedUserId } = req.body;
    try {
      await BlockedUser.create({ userId, blockedUserId });
      res.json({ success: true, message: 'User blocked successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  unblockUser: async (req, res) => {
    const { userId, blockedUserId } = req.body;
    try {
      await BlockedUser.destroy({ where: { userId, blockedUserId } });
      res.json({ success: true, message: 'User unblocked successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getBlockedUsers: async (req, res) => {
    const { userId } = req.params;
    try {
      const blocks = await BlockedUser.findAll({ where: { userId } });
      res.json({ success: true, blocks });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
