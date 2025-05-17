// models/ModerationAction.js

const { sequelize, DataTypes } = require('../src/db');

const ModerationAction = sequelize.define('ModerationAction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // who performed the moderation action
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',   // matches tableName in your User model
      key: 'id'
    }
  },
  // type of moderation (e.g. 'delete_message', 'suspend_user', etc)
  actionType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // optional ID of the target (e.g. messageId, reportId, userId)
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // any original reason or details
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // whether an admin has overridden this action
  overridden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // admin’s note for why it was overridden
  overrideReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'moderation_actions',
  timestamps: true
});

ModerationAction.associate = models => {
  ModerationAction.belongsTo(models.User, { foreignKey: 'userId', as: 'moderator' });
};

module.exports = ModerationAction;
