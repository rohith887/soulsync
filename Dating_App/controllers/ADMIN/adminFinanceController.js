// controllers/adminFinanceController.js
const { Sequelize } = require('sequelize');
const Subscription = require('../../models/Subscription');
const Refund = require('../../models/Refund');

module.exports = {
  getRevenue: async (req, res) => {
    try {
      const revenue = await Subscription.findAll({
        attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue']]
      });

      const totalRevenue = revenue[0].get('totalRevenue') || 0;

      res.json({ success: true, revenue: totalRevenue });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  
  processRefund: async (req, res) => {
    const { userId, amount, reason } = req.body;
    try {
      const refund = await Refund.create({ userId, amount, reason });
      res.json({ success: true, refund });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
  
  
    // getRefunds: async (req, res) => {
    //   try {
    //     const refunds = await Refund.findAll();
    //     res.json({ success: true, refunds });
    //   } catch (err) {
    //     res.status(500).json({ success: false, message: err.message });
    //   }
    // }
  