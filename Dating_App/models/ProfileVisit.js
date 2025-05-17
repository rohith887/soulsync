// models/ProfileVisit.js
const { sequelize, DataTypes } = require('../src/db');
const ProfileVisit = sequelize.define('ProfileVisit', {
  visitorId:    { type: DataTypes.INTEGER, allowNull: false },
  visitedId:    { type: DataTypes.INTEGER, allowNull: false },
  visitedAt:    { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'profile_visits',
  timestamps: false
});

module.exports = ProfileVisit;
