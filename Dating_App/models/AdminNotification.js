// models/Notification.js
const { DataTypes } = require('sequelize');
const sequelize      = require('../config/db');
const User           = require('./User');

const Admin_Notification = sequelize.define('Admin_Notification', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  adminId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'admin_notifications',
  timestamps: true    // adds createdAt / updatedAt
});

Admin_Notification.belongsTo(User, { as: 'recipient', foreignKey: 'userId' });
Admin_Notification.belongsTo(User, { as: 'sender',    foreignKey: 'adminId' });

module.exports = Admin_Notification;
