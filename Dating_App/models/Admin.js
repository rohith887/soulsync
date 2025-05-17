const bcrypt = require('bcryptjs');
const { sequelize, DataTypes } = require('../src/db');

const Admin = sequelize.define('Admin', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'superadmin'),
    allowNull: false,
    defaultValue: 'admin'
  }
}, {
  tableName: 'admins',
  timestamps: true,
  scopes: {
    superadmin: {
      where: { role: 'superadmin' }
    },
    admin: {
      where: { role: 'admin' }
    }
  }
});

// hash password
Admin.beforeCreate(async (admin) => {
  if (admin.password) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
  }
});

Admin.prototype.validPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = Admin;
