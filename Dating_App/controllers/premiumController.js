const User = require('../models/User');



const subscribe = async (req, res) => {
  const { userId } = req.params;

  try {
    // Log incoming request
    console.log("Incoming request to subscribe user with ID:", userId);

    // Check if the userId is valid
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is missing from the request." });
    }

    // Check if the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("User not found in database with ID:", userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update user to premium
    user.premium = true;
    await user.save();

    console.log("✅ User subscription updated successfully.");

    res.json({
      success: true,
      message: "Subscription activated",
      data: user,
    });
  } catch (error) {
    console.error("Error during subscription:", error.message);
    res.status(500).json({ success: false, message: "Error subscribing", error: error.message });
  }
};



const boostProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Assume boost lasts 30 minutes from now
    const boostUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await user.update({ boostActive: true, boostedUntil: boostUntil });

    res.json({
      success: true,
      message: "Profile boosted successfully",
      data: {
        boostActive: user.boostActive,
        boostedUntil: user.boostedUntil
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error boosting profile", error: error.message });
  }
};

const getPremiumHistory = async (req, res) => {
  const history = await Subscription.findAll({
      where: { 
          userId: req.user.id 
         } 
  });
  res.json({ success: true, history });
};


module.exports = {
    subscribe,boostProfile,getPremiumHistory
}

