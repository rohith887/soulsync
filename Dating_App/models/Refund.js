const { sequelize, DataTypes } = require('../src/db');
const Refund = sequelize.define('Refund', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'refunds',
  timestamps: true
});

module.exports = Refund;
