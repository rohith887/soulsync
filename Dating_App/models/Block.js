// // models/BlockedUser.js

// module.exports = (sequelize, DataTypes) => {
//   const BlockedUser = sequelize.define('BlockedUser', {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     },
//     blockedUserId: {
//       type: DataTypes.INTEGER,
//       allowNull: false
//     }
//   }, {
//     tableName: 'blocked_users', // Ensure your table name is correct
//     timestamps: true
//   });

//   BlockedUser.associate = (models) => {
//     BlockedUser.belongsTo(models.User, { foreignKey: 'userId' });
//     BlockedUser.belongsTo(models.User, { foreignKey: 'blockedUserId' });
//   };

//   return BlockedUser;
// };
