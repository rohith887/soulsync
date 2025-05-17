const { sequelize, DataTypes } = require('../src/db');

const Role = sequelize.define('Role', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
}, {
  tableName: 'roles',
  timestamps: true
});

// Export associate function separately
Role.associate = (models) => {
  Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
};

module.exports = Role;
