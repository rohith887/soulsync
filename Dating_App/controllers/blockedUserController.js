const BlockedUser = require('../models/BlockedUser'); // Adjust path accordingly

exports.blockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID is missing." });
    }

    await BlockedUser.create({ userId: req.user.id, blockedUserId });

    res.json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error blocking user", error: error.message });
  }
};


exports.unblockUser = async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    await BlockedUser.destroy({
      where: { userId: req.user.id, blockedUserId }
    });
    res.json({ success: true, message: "User unblocked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error unblocking user", error: error.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const blocked = await BlockedUser.findAll({ where: { userId: req.user.id } });
    res.json({ success: true, data: blocked });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching blocked users", error: error.message });
  }
};
