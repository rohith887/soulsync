module.exports = (sequelize, DataTypes) => {
    const Match = sequelize.define('Match', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'matched', 'blocked', 'unmatched'),
        defaultValue: 'pending'
      }
    }, {
      timestamps: true,
      tableName: 'matches'
    });
    return Match;
  };
  