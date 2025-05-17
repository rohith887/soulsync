// models/UserSession.js

const { sequelize, DataTypes } = require('../src/db'); 

const UserSession = sequelize.define('UserSession', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'user_sessions',  // Make sure this matches your actual table name
  timestamps: true,
});

UserSession.associate = (models) => {
  UserSession.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = UserSession;
