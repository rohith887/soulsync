// models/Subscription.js

const { sequelize, DataTypes } = require('../src/db');

const Subscription = sequelize.define('Subscription', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  planName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  duration: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  tableName: 'subscriptions',
  timestamps: false
});

Subscription.associate = (models) => {
  Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = Subscription;
