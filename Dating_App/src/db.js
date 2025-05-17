// // // src/db.js
// // const { Sequelize, DataTypes } = require('sequelize');

// // const DB_HOST = 'localhost';
// // const DB_USER = 'vshnu_banquetbookingz';
// // const DB_PASSWORD = 'Banquetbookingz@123';
// // const DB_NAME = 'vshnu_bumble';
// // const DB_DIALECT = 'mysql';
// // const DB_PORT = 3306;

// // console.log('🔍 DB Connection Config:', {
// //   DB_NAME,
// //   DB_USER,
// //   DB_HOST,
// //   DB_DIALECT,
// //   DB_PORT,
// // });

// // const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
// //   host: DB_HOST,
// //   dialect: DB_DIALECT,
// //   port: DB_PORT,
// //   logging: false,
// // });

// // console.log('Sequelize instance in db.js:', sequelize);

// // (async () => {
// //   try {
// //     await sequelize.authenticate();
// //     console.log('✅ Connected to MySQL successfully in db.js');
// //   } catch (error) {
// //     console.error('🚨 Database connection error in db.js:', error);
// //   }
// // })();

// // module.exports = { sequelize, DataTypes };



// // require('dotenv').config(); // Load .env first
// const mongoose = require('mongoose');

// // Check if MONGO_URL is loaded
// // console.log("MongoDB URL from .env:");






// src/db.js

const { Sequelize, DataTypes } = require("sequelize");

const DB_HOST = "localhost";
const DB_USER = "vshnu_banquetbookingz";
const DB_PASSWORD = "Banquetbookingz@123"; // Make sure this is the correct password you set for root.
const DB_NAME = "vshnu_bumble";
const DB_DIALECT = "mysql";
const DB_PORT = 3306;

console.log("🔍 DB Connection Config:", {
  DB_NAME, 
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT,
  DB_PORT,
});



const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  port: DB_PORT,
  logging: false,
});

console.log('Sequelize instance in db.js:', sequelize);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL successfully");
  } catch (error) {
    console.error("🚨 Database connection error:", error);
    process.exit(1);
  }
})();

module.exports = { sequelize, DataTypes };  // ✅ Exporting the sequelize instance and DataTypes
