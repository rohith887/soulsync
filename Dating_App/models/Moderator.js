const bcrypt = require('bcryptjs');
const { sequelize, DataTypes } = require('../src/db'); 

const Moderator = sequelize.define('Moderator', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('moderator'), defaultValue: 'moderator' },
  permissions: { type: DataTypes.JSON, allowNull: true }, // Example: { canBanUsers: true, canApprovePhotos: true }
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Moderator;
