// models/AppSetting.js
const { sequelize, DataTypes } = require('../src/db');

const AppSettings = sequelize.define('AppSetting', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Setting identifier, e.g., maxProfilesPerAdmin',
  },
  value: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Stored as string; can be parsed into int, boolean, etc. based on use',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional human-readable description of the setting',
  },
  type: {
    type: DataTypes.ENUM('boolean', 'number', 'string', 'json'),
    allowNull: false,
    defaultValue: 'string',
    comment: 'Helps interpret value correctly in the frontend/backend',
  },
  editableBy: {
    type: DataTypes.ENUM('superAdmin', 'admin', 'system'),
    allowNull: false,
    defaultValue: 'superAdmin',
    comment: 'Who can modify this setting',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional grouping, e.g., "limits", "features", "matching"',
  }
}, {
  tableName: 'app_settings',
  timestamps: true,
});

// (async () => {
//   await sequelize.sync();

//   await AppSettings.create({
//     key: 'max_login_attempts',
//     value: '5',
//     type: 'number',
//     editableBy: 'superAdmin',
//     category: 'security',
//     description: 'Maximum number of login attempts before lockout',
//   });

//   console.log("✅ Setting inserted");
//   process.exit();
// })();

module.exports = AppSettings;
