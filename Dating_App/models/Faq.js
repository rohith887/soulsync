const { sequelize, DataTypes } = require('../src/db');

const Faq = sequelize.define('Faq', {
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'faqs',
  timestamps: true
});

module.exports = Faq;
