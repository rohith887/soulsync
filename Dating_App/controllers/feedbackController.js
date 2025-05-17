const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. User ID is missing." });
    }

    await Feedback.create({
      userId,
      message,
      rating,
    });

    res.status(201).json({ success: true, message: "Feedback submitted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error submitting feedback", error: error.message });
  }
};
