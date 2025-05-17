const  UserPreference  = require('../models/UserPreference');

// ✅ 1. Create Preference (only if none exist)
exports.createPreference = async (req, res) => {
  const userId = req.user.id;
  const { preferredGender, preferredMinAge, preferredMaxAge, notificationsEnabled } = req.body;

  try {
    const existing = await UserPreference.findOne({ where: { userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Preferences already exist. Use update instead." });
    }

    const preference = await UserPreference.create({
      userId,
      preferredGender,
      preferredMinAge,
      preferredMaxAge,
      notificationsEnabled
    });

    res.status(201).json({ success: true, message: "Preferences created", data: preference });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating preferences", error: error.message });
  }
};

// ✅ 2. Get Preference
exports.getPreference = async (req, res) => {
  const userId = req.user.id;

  try {
    const preference = await UserPreference.findOne({ where: { userId } });
    if (!preference) {
      return res.status(404).json({ success: false, message: "Preferences not found" });
    }

    res.json({ success: true, data: preference });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching preferences", error: error.message });
  }
};

exports.updatePreference = async (req, res) => {
  console.log("✅ req.user in updatePreference:", req.user); // Debugging line

  const userId = req.user.id;
  const { preferredGender, preferredMinAge, preferredMaxAge, notificationsEnabled } = req.body;

  try {
    const preference = await UserPreference.findOne({ where: { userId } });
    if (!preference) {
      return res.status(404).json({ success: false, message: "Preferences not found. Create first." });
    }

    await preference.update({ preferredGender, preferredMinAge, preferredMaxAge, notificationsEnabled });
    res.json({ success: true, message: "Preferences updated", data: preference });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating preferences", error: error.message });
  }
};


// ✅ 4. Delete Preference
exports.deletePreference = async (req, res) => {
  const userId = req.user.id;

  try {
    const deleted = await UserPreference.destroy({ where: { userId } });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "No preferences found to delete" });
    }

    res.json({ success: true, message: "Preferences deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting preferences", error: error.message });
  }
};
