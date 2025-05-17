const FlaggedContent = require('../../models/FlaggedContent');

exports.listFlagged = async (req, res) => {
  // optionally filter by type: bio | photo | prompt
  const { type } = req.query;
  const where = type ? { type } : {};
  try {
    const flags = await FlaggedContent.findAll({ where, order: [['createdAt','DESC']] });
    res.json({ success: true, data: flags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFlagged = async (req, res) => {
  const { id } = req.params;
  const { action, note } = req.body; // action: 'approve'|'reject'
  try {
    const flag = await FlaggedContent.findByPk(id);
    if (!flag) return res.status(404).json({ success: false, message: 'Flagged item not found' });

    flag.status = action;
    if (note) flag.adminNote = note;
    await flag.save();

    res.json({ success: true, data: flag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
