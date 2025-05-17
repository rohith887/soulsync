// controllers/auditController.js
const { Op } = require('sequelize');
const AuditLog = require('../../models/AuditLog');
const User     = require('../../models/User');


exports.getAuditLogs = async (req, res) => {
  try {
    const { superAdminId, action, from, to, page = 1, limit = 20 } = req.body;

    const where = {};
    if (superAdminId) where.adminId = superAdminId;
    if (action) where.action = action;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }

    const { count: total, rows: logs } = await AuditLog.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      offset: (page - 1) * limit,
      limit,
     include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'email', 'username'] // only include real columns from users table
     }]

    });

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    return res.status(500).json({ error: 'Could not fetch audit logs' });
  }
};
