const { sequelize, DataTypes } = require('../src/db');
const SupportTicket = sequelize.define('SupportTicket', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'resolved'),
    defaultValue: 'open'
  }
}, {
  tableName: 'support_tickets',
  timestamps: true
});

module.exports = SupportTicket;
