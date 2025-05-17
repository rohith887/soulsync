// controllers/admin/sessionController.js
const Session = require('../../models/Session');

exports.getUserSessions = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const sessions = await Session.findAll({
      where: { userId, isActive: true },
      order: [['lastActivity','DESC']]
    });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logoutAllSessions = async (req, res) => {
  const { id: userId } = req.params;
  try {
    await Session.update({ isActive: false }, { where: { userId } });
    res.json({ success: true, message: 'All sessions terminated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
