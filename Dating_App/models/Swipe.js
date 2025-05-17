const { sequelize, DataTypes } = require('../src/db');
const User = require('./User'); // Assuming User model is in the same directory
const Match = require('./Match'); // Assuming Match model is in the same directory
const Swipe = sequelize.define('Swipe', {
  userId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    allowNull: false,
  },
  targetUserId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    allowNull: false,
  },
  liked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  isSuperSwipe: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Swipe.belongsTo(User, { as: 'user', foreignKey: 'userId' });
// Swipe.belongsTo(User, { as: 'targetUser', foreignKey: 'targetUserId' });
// Swipe.belongsTo(Match, { foreignKey: 'matchId' });
module.exports = Swipe;