const { sequelize, DataTypes } = require('../src/db');

const Feedback = sequelize.define('Feedback', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'feedbacks',
  timestamps: true,
});

Feedback.associate = (models) => {
  Feedback.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = Feedback;
