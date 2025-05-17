'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'latitude');
    await queryInterface.removeColumn('users', 'longitude');
  }
};
