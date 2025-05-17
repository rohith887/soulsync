const { sequelize, DataTypes } = require('../../src/db');
const User = require('../../models/User')
const Subscription = require('../../models/Subscription')

module.exports = {
  getSubscriptions: async (req, res) => {
    try {
      const subscriptions = await SubscriptionModel.findAll({
        include: [{
          model: UserModel,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }]
      });

      if (!subscriptions || subscriptions.length === 0) {
        return res.status(404).json({ success: false, message: "No subscriptions found in DB" });
      }

      res.json({ success: true, subscriptions });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },


  createPlan: async (req, res) => {
    try {
      console.log("Incoming Request Body:", req.body); // ✅ Debugging line

      const { userId, planName, amount, duration, features } = req.body;

      // Validate required fields
      if (!userId || !planName || !amount) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields: userId, planName, and amount."
        });
      }

      // Create the subscription plan
      const plan = await SubscriptionModel.create({
        userId,
        planName,
        amount,
        duration,
        features
      });

      res.json({ success: true, message: 'Plan created successfully', plan });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
,

  updateUserPremium: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isPremium } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await User.update({ isPremium }, { where: { id: userId } });

      res.json({ success: true, message: 'User premium status updated' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};


exports.listSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({ order: [['createdAt','DESC']] });
    res.json({ success: true, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const sub = await Subscription.findByPk(id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    sub.status = 'cancelled';
    await sub.save();

    res.json({ success: true, message: 'Subscription cancelled', data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};