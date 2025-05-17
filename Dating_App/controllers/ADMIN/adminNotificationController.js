// controllers/notificationController.js
const Notification = require('../models/AdminNotification');
const User         = require('../models/User');

/**
 * POST /admin/notifications/send
 * Body: { userId, title, message }
 */
exports.sendNotification = async (req, res) => {
  const { userId, title, message } = req.body;
  const senderId = req.user.id;             // from your auth middleware

  // 1) Validate input
  if (!userId || !title || !message) {
    return res
      .status(400)
      .json({ success: false, error: 'userId, title and message are required' });
  }

  try {
    // 2) Ensure the target user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: 'Target user not found' });
    }

    // 3) Create the notification
    const notification = await Notification.create({
      userId,
      adminId: senderId,
      title,
      message,
      isRead: false
    });

    // 4) (optional) — push via WebSocket / push service here

    // 5) Respond
    return res.status(201).json({
      success: true,
      notification: {
        id:        notification.id,
        userId:    notification.userId,
        adminId:   notification.adminId,
        title:     notification.title,
        message:   notification.message,
        isRead:    notification.isRead,
        createdAt: notification.createdAt
      }
    });
  } catch (err) {
    console.error('sendNotification error:', err);
    return res
      .status(500)
      .json({ success: false, error: 'Could not send notification' });
  }
};
