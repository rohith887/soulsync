module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('text', 'image', 'audio', 'location'),
        defaultValue: 'text',
      },
      status: {
        type: DataTypes.ENUM('sent', 'delivered', 'seen'),
        defaultValue: 'sent',
      },
      adminSent: {
       type: DataTypes.BOOLEAN,
       defaultValue: false
     },
     metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
    }, {
      timestamps: true,
      tableName: 'messages'
    });
    return Message;
  };
  