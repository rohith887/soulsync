// models/Chat.js

const { sequelize, DataTypes } = require('../src/db');

const Chat = sequelize.define('Chat', {
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  media: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Track if the message has been read
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Track if the message has been deleted
  }
}, {
  tableName: 'chats', // The name of the table in the database
  timestamps: true, // Adds `createdAt` and `updatedAt` fields
  updatedAt: false, // Only keep `createdAt` if you prefer
});

// Associations
Chat.associate = (models) => {
  Chat.belongsTo(models.Match, { as: 'match', foreignKey: 'matchId' });
  Chat.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
};

module.exports = Chat;
