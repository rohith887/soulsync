const { sequelize, DataTypes } = require('../src/db');

const Message = sequelize.define('Message', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'audio', 'location'),
    defaultValue: 'text',
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'seen'),
    defaultValue: 'sent',
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'messages',
});

module.exports = Message;