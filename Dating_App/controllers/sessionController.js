const  UserSession  = require('../models/UserSession');

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID is missing." });
    }

    const sessions = await UserSession.findAll({ where: { userId } });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error getting sessions", error: error.message });
  }
};


exports.logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await UserSession.destroy({ where: { id: sessionId, userId: req.user.id } });
    res.json({ success: true, message: "Session logged out" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing session", error: error.message });
  }
};
