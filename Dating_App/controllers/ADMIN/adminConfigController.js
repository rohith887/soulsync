//const { AppSetting } = require('../models');
const AppSettings = require('../../models/AppSettings');


exports.getSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findAll();
    res.status(200).json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const [updated] = await AppSettings.update({ value }, { where: { key } });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Setting with key "${key}" not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Setting "${key}" updated successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
