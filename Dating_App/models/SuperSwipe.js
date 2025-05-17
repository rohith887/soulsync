const { sequelize, DataTypes } = require('../src/db');

const SuperSwipe = sequelize.define('SuperSwipe', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'super_swipes',
  timestamps: true
});

module.exports = SuperSwipe;
