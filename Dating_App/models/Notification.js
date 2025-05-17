const { sequelize, DataTypes } = require('../src/db');

const Notification = sequelize.define('Notification', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      'match',
      'message',
      'like',
      'superLike',
      'opening_move',
      'expiry_warning',
      'beeline',
      'profile_view',
      'suggestion',
      'promo'
    ),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT, // changed from STRING to TEXT for longer messages
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  mode: {
    type: DataTypes.ENUM('date', 'bff', 'bizz'),
    allowNull: true,
  },
  isEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'Notifications',
  timestamps: true,
  updatedAt: false,
});

// 🔗 Associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Notification;
