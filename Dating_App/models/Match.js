
const { sequelize, DataTypes } = require('../src/db');

const Match = sequelize.define('Match', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
targetUserId: {
  type: DataTypes.INTEGER,
  allowNull: false,
},
  status: {
    type: DataTypes.ENUM('liked', 'disliked', 'matched'),
    allowNull: false,
  },
  firstMessageSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  openingMove: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  openingMoveResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  mode: {
    type: DataTypes.STRING, // Add mode column
    allowNull: false,
    defaultValue: 'date', // Default to 'date'
  },
}, {
  tableName: 'matches',
  timestamps: true,
  updatedAt: false,
});

Match.associate = (models) => {
  Match.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  Match.belongsTo(models.User, { as: 'targetUser', foreignKey: 'targetUserId' });
};

module.exports = Match;






// // models/Match.js

// const { sequelize, DataTypes } = require('../src/db');
// const Match = sequelize.define('Match', {
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   targetUserId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.ENUM('liked', 'disliked', 'matched'),
//     allowNull: false,
//   },
//   firstMessageSent: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   openingMove: {
//     type: DataTypes.STRING,
//     allowNull: true, // Pre-set prompt for Opening Moves
//   },
//   openingMoveResponse: {
//     type: DataTypes.TEXT,
//     allowNull: true, // Response to Opening Move
//   },
//   expiresAt: {
//     type: DataTypes.DATE,
//     defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//   },
// }, {
//   tableName: 'matches', // Make sure your database table name is `matches`
//   timestamps: true, // Adds `createdAt` and `updatedAt` fields
//   updatedAt: false, // Only keep `createdAt` if you prefer
// });

// Match.associate = (models) => {
//   Match.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
//   Match.belongsTo(models.User, { as: 'targetUser', foreignKey: 'targetUserId' });
// };

// module.exports = Match;
