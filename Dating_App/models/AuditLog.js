const { sequelize, DataTypes } = require('../src/db');
const User = require('./User');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM('suspension', 'report_resolution', 'other'),
    allowNull: false,
  },
  targetId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  targetModel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'audit_logs',
  timestamps: false,
});

// ✅ Fix association — change alias if needed
AuditLog.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });

module.exports = AuditLog;
