const { sequelize, DataTypes } = require('../src/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending"
  }
}, {
  tableName: 'reports',
  timestamps: true
});

// 🔗 Associations
Report.associate = (models) => {
  Report.belongsTo(models.User, { foreignKey: 'userId', as: 'reporter' });
  Report.belongsTo(models.User, { foreignKey: 'reportedUserId', as: 'reportedUser' });
};

module.exports = Report;
