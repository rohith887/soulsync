const  User  = require('../models/User');
const Report = require('../models/Report');
const Block  = require('../models/Block')


exports.reportUser = async (req, res) => {
  const { reportedUserId, reason } = req.body;
  const userId = req.user.id; // Make sure `req.user` is populated by your Auth middleware

  try {
    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ success: false, message: "Reported user not found" });
    }

    const report = await Report.create({
      userId,
      reportedUserId,
      reason,
      status: "pending"
    });

    res.json({ success: true, message: "User reported successfully", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error reporting user", error: error.message });
  }
};

// 🚫 Block User
exports.blockUser = async (req, res) => {
  const { userId } = req.params;
  const { blockedUserId } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const block = await Block.create({
      userId,
      blockedUserId
    });

    res.json({ success: true, message: "User blocked successfully", data: block });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error blocking user", error: error.message });
  }
};
