const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { createToken, generateRefreshToken } = require('../auth/jwt');

// ===============================
// ⚙️ SETTINGS CONTROLLER
// ===============================

exports.getSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized. User ID is missing." });

    const [user, settings] = await Promise.all([
      User.findByPk(userId, { attributes: ['mode', 'email', 'phoneNumber'] }),
      UserSettings.findOne({ where: { userId } })
    ]);

    if (!settings) return res.status(404).json({ success: false, message: "Settings not found for this user." });

    res.json({ success: true, data: { ...settings.toJSON(), email: user.email, phoneNumber: user.phoneNumber, currentMode: user.currentMode } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching settings", error: error.message });
  }
};

// exports.getUserSettings = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const settings = await UserSettings.findOne({ where: { userId } });
//     if (!settings) return res.status(404).json({ message: "Settings not found" });

//     res.json({ success: true, data: settings });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching settings", error: error.message });
//   }
// };

exports.updateSettings = async (req, res) => {
  try {
    const {
      language,
      region,
      theme,
      showToGender,
      twoFactorEnabled,
      darkMode,
      notificationsEnabled,
      currentMode
    } = req.body;

    const [settings] = await UserSettings.findOrCreate({ where: { userId: req.user.id } });

    await settings.update({
      language,
      region,
      theme,
      showToGender,
      twoFactorEnabled,
      darkMode,
      notificationsEnabled
    });

    if (currentMode && ['date', 'bff', 'bizz'].includes(currentMode)) {
      await User.update({ currentMode }, { where: { id: req.user.id } });
    }

    res.json({ success: true, message: "Settings updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating settings", error: error.message });
  }
};

// ===============================
// 🔐 ACCOUNT MANAGEMENT
// ===============================

exports.changePassword = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(403).json({ message: "Unauthorized. User ID missing." });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "Old and new password required." });

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id; // Now, req.user.id should be available
  const allowedFields = ['firstName', 'lastName', 'bio', 'age', 'gender', 'location', 'occupation', 'education', 'company', 'photoUrl', 'instagram', 'spotifyArtists', 'prompt', 'promptResponse'];

  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(updates);
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};


exports.updateLoginInfo = async (req, res) => {
  const userId = req.user.id;
  const { email, phoneNumber } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ email, phoneNumber });
    res.json({ success: true, message: "Login credentials updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating credentials", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error during logout", error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ success: true, message: "Account deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting account", error: error.message });
  }
};

// ===============================
// 💎 SUBSCRIPTION MANAGEMENT
// ===============================

exports.getSubscription = async (req, res) => {
  // Stub for fetching subscription plan (mock for now)
  res.json({
    success: true,
    data: {
      plan: "Premium",
      renewalDate: "2025-12-31",
      autoRenew: true,
      features: ["Beeline", "Incognito Mode", "Backtrack", "Advanced Filters"]
    }
  });
};

exports.applyCoupon = async (req, res) => {
  const { couponCode } = req.body;

  if (couponCode === "BUMBLE30") {
    res.json({ success: true, message: "30% discount applied!" });
  } else {
    res.status(400).json({ success: false, message: "Invalid or expired coupon code." });
  }
};

exports.restorePurchase = async (req, res) => {
  res.json({
    success: true,
    message: "Subscription restored successfully"
  });
};

// ===============================
// 🔔 NOTIFICATION CONTROLLER
// ===============================

exports.getNotifications = async (req, res) => {
  try {
    const settings = await UserSettings.findOne({ where: { userId: req.user.id } });
    res.json({
      success: true,
      data: {
        notifyOnLike: settings.notifyOnLike,
        notifyOnMatch: settings.notifyOnMatch,
        notifyOnMessage: settings.notifyOnMessage,
        notifyOnPromo: settings.notifyOnPromo,
        notifyOnProfileView: settings.notifyOnProfileView,
        notifyOnSuggestion: settings.notifyOnSuggestion,
        notifyOnExpiryWarning: settings.notifyOnExpiryWarning
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notification settings", error: error.message });
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      notifyOnLike,
      notifyOnMatch,
      notifyOnMessage,
      notifyOnPromo,
      notifyOnProfileView,
      notifyOnSuggestion,
      notifyOnExpiryWarning
    } = req.body;

    const [settings, created] = await UserSettings.findOrCreate({
      where: { userId },
      defaults: {
        notifyOnLike,
        notifyOnMatch,
        notifyOnMessage,
        notifyOnPromo,
        notifyOnProfileView,
        notifyOnSuggestion,
        notifyOnExpiryWarning
      }
    });

    if (!created) {
      await settings.update({
        notifyOnLike,
        notifyOnMatch,
        notifyOnMessage,
        notifyOnPromo,
        notifyOnProfileView,
        notifyOnSuggestion,
        notifyOnExpiryWarning
      });
    }

    res.json({ success: true, message: "Notification settings updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating notification settings", error: error.message });
  }
};

exports.markRead = async (req, res) => {
  const { userId } = req.params;

  try {
    const [updatedCount] = await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );

    res.json({
      success: true,
      message: `${updatedCount} notification(s) marked as read`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating notifications", error: error.message });
  }
};

exports.createNotification = async ({ userId, type, content, mode = null, matchId = null }) => {
  try {
    await Notification.create({
      userId,
      type,
      content,
      mode,
      matchId,
      read: false
    });
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};

// ===============================
// 🛡️ SAFETY & PRIVACY CONTROLS
// ===============================

const Report = require('../models/Report');
const Block = require('../models/Block');

// ✅ Report a User
exports.reportUser = async (req, res) => {
  const { reportedUserId, reason, comment } = req.body;
  const userId = req.user.id;

  try {
    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) return res.status(404).json({ success: false, message: "Reported user not found" });

    const report = await Report.create({
      userId,
      reportedUserId,
      reason,
      status: "pending",
      comment: comment || null
    });

    res.json({ success: true, message: "User reported successfully", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error reporting user", error: error.message });
  }
};

// ✅ Block a User
exports.blockUser = async (req, res) => {
  const userId = req.user.id;
  const { blockedUserId } = req.body;

  try {
    const blockedUser = await User.findByPk(blockedUserId);
    if (!blockedUser) return res.status(404).json({ success: false, message: "User to block not found" });

    const block = await Block.create({ userId, blockedUserId });
    res.json({ success: true, message: "User blocked successfully", data: block });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error blocking user", error: error.message });
  }
};

// ✅ Unblock a User
exports.unblockUser = async (req, res) => {
  const userId = req.user.id;
  const { blockedUserId } = req.body;

  try {
    const removed = await Block.destroy({ where: { userId, blockedUserId } });
    if (!removed) return res.status(404).json({ success: false, message: "Block record not found" });

    res.json({ success: true, message: "User unblocked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error unblocking user", error: error.message });
  }
};

// ✅ Get Blocked Users
exports.getBlockedUsers = async (req, res) => {
  const userId = req.user.id;

  try {
    const blocks = await Block.findAll({
      where: { userId },
      include: [{ model: User, as: 'blocked', attributes: ['id', 'firstName', 'photoUrl'] }]
    });

    res.json({ success: true, data: blocks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error retrieving blocked users", error: error.message });
  }
};

// ✅ Stub for Private Detector
exports.privateDetector = async (req, res) => {
  res.json({ success: true, message: "Private Detector is active. Inappropriate photos will be blurred automatically." });
};


// ✅ Notification Types You Can Trigger
/*
  type: 'match', content: "It’s a match! Start the conversation."
  type: 'opening_move', content: "You’ve got a message – respond within 24h!"
  type: 'expiry_warning', content: "Your match will expire soon – don’t miss your chance!"
  type: 'message', content: "New message from [Name]"
  type: 'beeline', content: "Someone liked you – see who!"
  type: 'profile_view', content: "Your profile got a visit"
  type: 'suggestion', content: "New people near you are waiting to connect"
  type: 'promo', content: "Get 30% off Bumble Premium – this weekend only!"
*/

