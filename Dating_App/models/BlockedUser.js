// models/BlockedUser.js

// const { DataTypes } = require('sequelize');
// const sequelize = require('../src/db');  // Make sure this path points to your Sequelize instance

const { sequelize, DataTypes } = require('../src/db');
const BlockedUser = sequelize.define('BlockedUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  blockedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'blocked_users',
  timestamps: true
});

// Export the BlockedUser model
module.exports = BlockedUser;
