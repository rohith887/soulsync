
const UserSettings = require('../models/UserSettings');
const Notification = require('../models/Notification');

// ✅ Get Notification Preferences
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

// ✅ Update Notification Preferences
exports.updateNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized. User ID is missing." });

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

// ✅ Mark All Notifications As Read
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

// ✅ Create a Notification (System trigger example)
exports.createNotification = async ({ userId, type, content }) => {
  try {
    await Notification.create({ userId, type, content, read: false });
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
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
