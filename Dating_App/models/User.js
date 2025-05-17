const { sequelize, DataTypes } = require('../src/db');
const bcrypt = require('bcryptjs');
const Role = require('./Role');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: true },
  createdByAdminId: { type: DataTypes.INTEGER, allowNull: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: true, validate: { isEmail: true } },
  phoneNumber: { type: DataTypes.STRING, unique: true, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.ENUM('admin', 'user', 'moderator'), defaultValue: 'user' },
//  roleId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     field: 'role_id',                // ← map this JS field to the DB column `role_id`
//     references: {
//       model: 'roles',
//       key: 'id'
//     }
//  },
  mode: { type: DataTypes.ENUM('date', 'bff', 'bizz'), defaultValue: 'date' },
  lastLogin: { type: DataTypes.DATE, allowNull: true },
  otp: { type: DataTypes.STRING, allowNull: true },
  otpExpires: { type: DataTypes.DATE, allowNull: true },
  googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
  facebookId: { type: DataTypes.STRING, allowNull: true, unique: true },
  firstName: { type: DataTypes.STRING, allowNull: true },
  age: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 18 } },
  gender: { type: DataTypes.ENUM('male', 'female', 'non-binary', 'other'), allowNull: true },
  status: { type: DataTypes.ENUM('active', 'suspended'), defaultValue: 'active' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  bio: { type: DataTypes.TEXT, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  occupation: { type: DataTypes.STRING, allowNull: true },
  company: { type: DataTypes.STRING, allowNull: true },
  education: { type: DataTypes.STRING, allowNull: true },
  height: { type: DataTypes.INTEGER, allowNull: true },
  drinking: { type: DataTypes.ENUM('yes', 'no', 'sometimes'), allowNull: true },
  smoking: { type: DataTypes.ENUM('yes', 'no', 'sometimes'), allowNull: true },
  lookingFor: { type: DataTypes.ENUM('relationship', 'casual', 'friendship', 'not_sure'), allowNull: true },
  kids: { type: DataTypes.ENUM('have', 'want', 'dont_want', 'not_sure'), allowNull: true },
  zodiac: { 
    type: DataTypes.ENUM('aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'), 
    allowNull: true 
  },
  religion: { type: DataTypes.STRING, allowNull: true },
  politicalViews: { 
    type: DataTypes.ENUM('liberal', 'conservative', 'moderate', 'other', 'prefer_not_to_say'), 
    allowNull: true 
  },
  exercise: { type: DataTypes.ENUM('daily', 'weekly', 'rarely', 'never'), allowNull: true },
  pets: { type: DataTypes.STRING, allowNull: true },
  languages: { type: DataTypes.STRING, allowNull: true },
  instagram: { type: DataTypes.STRING, allowNull: true },
  spotifyArtists: { type: DataTypes.STRING, allowNull: true },
  lastActive: { type: DataTypes.DATE, allowNull: true },
  profileCompletion: { type: DataTypes.INTEGER, defaultValue: 0 },
  photoUrl: { type: DataTypes.STRING, allowNull: true },
  isPrimaryPhoto: { type: DataTypes.BOOLEAN, defaultValue: false },
  prompt: { type: DataTypes.STRING, allowNull: true },
  promptResponse: { type: DataTypes.TEXT, allowNull: true },
  minAgePreference: { type: DataTypes.INTEGER, allowNull: true },
  maxAgePreference: { type: DataTypes.INTEGER, allowNull: true },
  maxDistancePreference: { type: DataTypes.INTEGER, allowNull: true },
  genderPreference: { type: DataTypes.STRING, allowNull: true },
  isFake: { type: DataTypes.BOOLEAN, defaultValue: false },
  adminNotes: { type: DataTypes.TEXT, allowNull: true }
  // In models/User.js, add:
// latitude:  { type: DataTypes.FLOAT, allowNull: true },
// longitude: { type: DataTypes.FLOAT, allowNull: true }

}, {
  tableName: 'users',
  timestamps: true
//  underscored: true,
});

User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

module.exports = User;