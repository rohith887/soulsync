// models/Payment.js

const { sequelize, DataTypes } = require('../src/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',    // matches tableName: 'users' in your User model
      key: 'id'
    }
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subscriptions', // match your Subscription.tableName
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'completed'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true
});

Payment.associate = models => {
  // assumes models.User is your User model and models.Subscription your Subscription model
  Payment.belongsTo(models.User,         { foreignKey: 'userId' });
  Payment.belongsTo(models.Subscription, { foreignKey: 'subscriptionId' });
};

module.exports = Payment;
