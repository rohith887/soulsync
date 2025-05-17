require("dotenv").config();
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const path = require("path");
// const { sequelize } = require("./db"); // This properly imports the sequelize instance
const { sequelize } = require("../models"); // Import from models/index.js
// const passport = require("./passport");
const http = require('http');
const { initChatSocket } = require('../chat/chatSocket'); // Import Socket.IO initialization

// Importing route files
const userRoutes = require("../routes/userRoutes");
const userProfileRoutes = require("../routes/userProfileRoutes");
const adminRoutes = require("../routes/adminRoutes");
const superAdminRoutes = require("../routes/superAdminRoutes");
// const authRoutes = require("../routes/authRoutes");  // Make sure this exports a router
const chatRoutes = require("../routes/chatRoutes");
const matchRoutes = require("../routes/matchRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const preferenceRoutes = require("../routes/preferenceRoutes");
const premiumRoutes = require("../routes/premiumRoutes");
const safetyRoutes = require("../routes/safetyRoutes");
const settingsRoutes = require("../routes/settingsRoutes");

const app = express();
const PORT = 6100;
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = require('socket.io')(server); // Initialize Socket.IO
global.io = io; // Make io globally accessible for ChatController
initChatSocket(io); // Initialize chat socket handlers


// Middleware to parse JSON & URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

// Middleware for logging and handling CORS
app.use(cors());
app.use(morgan('dev'));

app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// Use the routes
app.use('/user', userRoutes);
app.use('/profile', userProfileRoutes);
app.use('/admin', adminRoutes);
// app.use('/auth', authRoutes);  // Correct usage of '/auth'
app.use('/superAdmin', superAdminRoutes);
app.use('/settings', settingsRoutes);
app.use('/chat', chatRoutes);
app.use('/match', matchRoutes);
app.use('/preference', preferenceRoutes);
app.use('/notification', notificationRoutes);
app.use('/premium', premiumRoutes);
app.use('/safety', safetyRoutes);

// Error handling middleware (Important!)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack for debugging
  res.status(500).json({ error: err.message }); // Send a generic error response
});

// Display loaded routes for debugging
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`Loaded Route: ${middleware.route.path}`);
  }
});

app.get('/', (req, res) => {
  res.send("Server is running!");
});

// Sync Sequelize models and start the server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully");

    await sequelize.sync(); // Sync models with DB (use { force: true } to reset tables)
    // await sequelize.sync({ alter: true });

    console.log("All models synchronized with database");


      app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://97.74.93.26:${PORT}`);
    });
    
// app.listen(PORT, '127.0.0.1', () => {
//   console.log(`Server is running on http://127.0.0.1:${PORT}`);
// });

  } catch (error) {
    console.error("Database connection error:", error);
    // process.exit(1);
  }
})();
