'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('matches', 'mode', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('matches', 'mode');
  }
};
