// controllers/ADMIN/adminAnalyticsController.js

const { Op, fn, col }     = require('sequelize');
const User                = require('../../models/User');
const Match               = require('../../models/Match');
const Chat                = require('../../models/Chat');
const Subscription        = require('../../models/Subscription');
const Payment             = require('../../models/Payment');    // ← Add this import

exports.getOverviewStats = async (req, res) => {
  try {
    const [ totalUsers, totalMatches, totalMessages, totalRevenue ] = await Promise.all([
      User.count(),
      Match.count(),
      Chat.count(),
      Subscription.sum('amount')
      // Or if you prefer Payment for overview revenue:
      // Payment.sum('amount')
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalMatches, totalMessages, totalRevenue }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.dailySignups = async (req, res) => {
  const days  = parseInt(req.query.days, 10) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const data = await User.findAll({
      attributes: [
        [ fn('DATE', col('createdAt')), 'date' ],
        [ fn('COUNT', col('id')),      'count' ]
      ],
      where:  { createdAt: { [Op.gte]: since } },
      group:  ['date'],
      order:  [['date','ASC']]
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.revenueTrend = async (req, res) => {
  const days  = parseInt(req.query.days, 10) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const data = await Payment.findAll({    // ← Now Payment is defined
      attributes: [
        [ fn('DATE', col('createdAt')), 'date' ],
        [ fn('SUM',   col('amount')),    'totalRevenue' ]
      ],
      where:  { createdAt: { [Op.gte]: since } },
      group:  ['date'],
      order:  [['date','ASC']]
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
