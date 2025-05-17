
const { sequelize, DataTypes } = require('../src/db');

const UserPreference = sequelize.define('UserPreference', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  mode: {
    type: DataTypes.ENUM('date', 'bff', 'bizz'),
    defaultValue: 'date'
  },
  genderPreference: {
    type: DataTypes.STRING
  },
  ageRangeMin: {
    type: DataTypes.INTEGER
  },
  ageRangeMax: {
    type: DataTypes.INTEGER
  },
  maxDistanceKm: {
    type: DataTypes.INTEGER
  },
  relationshipType: {
    type: DataTypes.STRING // relationship, casual, friendship
  },
  verifiedOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smoking: {
    type: DataTypes.STRING // yes, no, sometimes
  },
  drinking: {
    type: DataTypes.STRING
  },
  exercise: {
    type: DataTypes.STRING // daily, weekly, rarely
  },
  religion: {
    type: DataTypes.STRING
  },
  politicalViews: {
    type: DataTypes.STRING
  },
  zodiac: {
    type: DataTypes.STRING
  },
  kids: {
    type: DataTypes.STRING
  },
  education: {
    type: DataTypes.STRING
  },
  heightMin: {
    type: DataTypes.INTEGER
  },
  heightMax: {
    type: DataTypes.INTEGER
  },
  languages: {
    type: DataTypes.STRING // comma-separated or JSON string
  }
}, {
  tableName: 'user_preferences',
  timestamps: true
});

module.exports = UserPreference;
