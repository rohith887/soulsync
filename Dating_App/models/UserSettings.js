// models/UserSettings.js
const { sequelize, DataTypes } = require('../src/db');

const UserSettings = sequelize.define('UserSettings', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en',
  },
  region: {
    type: DataTypes.STRING,
    defaultValue: 'US',
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'light',
  },
  showToGender: {
    type: DataTypes.STRING,
    defaultValue: 'all',
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notifyOnLike: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notifyOnMatch: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notifyOnMessage: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'user_settings',
  timestamps: true
});

module.exports = UserSettings;
