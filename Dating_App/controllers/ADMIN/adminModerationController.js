// controllers/ADMIN/adminModerationController.js

const { Op } = require('sequelize');
const User               = require('../../models/User');
const Report             = require('../../models/Report');
const Chat               = require('../../models/Chat');
const ModerationAction   = require('../../models/ModerationAction');

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        { model: User, as: 'reporter',     attributes: ['id', 'firstName', 'email'] },
        { model: User, as: 'reportedUser', attributes: ['id', 'firstName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resolveReport = async (req, res) => {
  const { reportId } = req.params;
  if (!reportId) {
    return res.status(400).json({ success: false, message: 'Missing report ID' });
  }

  try {
    const [ updatedCount ] = await Report.update(
      { status: 'resolved' },
      { where: { id: reportId, status: { [Op.ne]: 'resolved' } } }
    );
    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Report not found or already resolved' });
    }
    res.json({ success: true, message: 'Report marked as resolved.' });
  } catch (err) {
    console.error('Error in resolveReport:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  if (!messageId) {
    return res.status(400).json({ success: false, message: 'Missing message ID' });
  }

  try {
    const deletedCount = await Chat.destroy({ where: { id: messageId } });
    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Message not found or already deleted' });
    }
    res.json({ success: true, message: 'Message deleted by admin.' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.listModerationActions = async (req, res) => {
  try {
    const actions = await ModerationAction.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: actions });
  } catch (err) {
    console.error('Error fetching moderation actions:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.overrideModeration = async (req, res) => {
  const { id } = req.params;
  const { override, reason } = req.body;
  if (override === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "'override' boolean is required" });
  }

  try {
    const action = await ModerationAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ success: false, message: 'Action not found' });
    }

    action.overridden     = Boolean(override);
    action.overrideReason = reason || null;
    await action.save();
    res.json({ success: true, data: action });
  } catch (err) {
    console.error('Error overriding moderation action:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
