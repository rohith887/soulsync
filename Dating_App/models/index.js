const { sequelize } = require('../src/db');
const User = require('./User');
const Swipe = require('./Swipe');
const Match = require('./Match');
const Message = require('./Message');
const Report = require('./Report');
const Subscription = require('./Subscription');

// Define associations
Swipe.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Swipe.belongsTo(User, { as: 'targetUser', foreignKey: 'targetUserId' });
Swipe.belongsTo(Match, { foreignKey: 'matchId' });

Match.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Match.belongsTo(User, { foreignKey: 'targetUserId', as: 'MatchedUser' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });
Message.belongsTo(Match, { foreignKey: 'matchId', as: 'Match' });

Report.belongsTo(User, { foreignKey: 'userId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });

Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Report, { foreignKey: 'userId', as: 'reportsMade' });
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportsReceived' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });

// Sync database (use with caution in production)
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Database sync error:', err);
});

module.exports = {
  sequelize,
  User,
  Swipe,
  Match,
  Message,
  Report,
  Subscription,
};