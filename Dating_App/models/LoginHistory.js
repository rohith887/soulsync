const { sequelize, DataTypes } = require('../src/db');
const LoginHistory = sequelize.define('LoginHistory', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  loginAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'login_histories',
  timestamps: false,  // If you want to manually manage createdAt and updatedAt
});

module.exports = LoginHistory;
