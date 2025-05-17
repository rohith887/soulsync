const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');
const { createToken, generateRefreshToken } = require('../../auth/jwt');

//const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ✅ Admin Sign Up
exports.adminSignUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });

    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'Admin with this email already exists.' });
    }

    const admin = await Admin.create({ username, email, password });
    res.status(201).json({ success: true, message: 'Admin registered successfully.', data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error during admin registration.', error: error.message });
  }
};

// ✅ Admin Login
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ where: { email } });
  
      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }
  
      const accessToken = createToken(admin);
      const refreshToken = generateRefreshToken(admin);
  
      res.json({ 
        success: true, 
        message: 'Login successful.',
        access_token: accessToken,
        refresh_token: refreshToken,
        admin: { id: admin.id, email: admin.email, role: admin.role }
      });
  
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error during login.', error: error.message });
    }
  };
  
// ✅ Admin Update
exports.updateAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  const adminId = req.params.adminId;

  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });

    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.json({ success: true, message: 'Admin updated successfully.', admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating admin.', error: error.message });
  }
};



































































































































































































































// const { User } = require('../models'); // Sequelize User model

// // ✅ Get All Users
// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.findAll();
//     res.json({ success: true, data: users });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error fetching users", error: error.message });
//   }
// };

// // ✅ Suspend User
// exports.suspendUser = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const [updatedRowsCount, [updatedUser]] = await User.update(
//       { suspended: true },
//       { where: { id: userId }, returning: true } // "returning" is required to get updated data (Postgres)
//     );

//     if (updatedRowsCount === 0) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.json({ success: true, message: "User suspended", data: updatedUser });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error suspending user", error: error.message });
//   }
// };

// /*
// // adminSecurityController.js

// const { Block, User } = require('../models');

// module.exports = {
//   blockUser: async (req, res) => {
//     const { userId, blockedUserId } = req.body;
//     try {
//       await Block.create({ userId, blockedUserId });
//       res.json({ success: true, message: 'User blocked successfully' });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },

//   unblockUser: async (req, res) => {
//     const { userId, blockedUserId } = req.body;
//     try {
//       await Block.destroy({ where: { userId, blockedUserId } });
//       res.json({ success: true, message: 'User unblocked' });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },

//   getBlockedUsers: async (req, res) => {
//     const { userId } = req.params;
//     try {
//       const blocks = await Block.findAll({ where: { userId } });
//       res.json({ success: true, blocks });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// };

// // adminConfigController.js

// const { AppSetting } = require('../models');

// module.exports = {
//   getSettings: async (req, res) => {
//     try {
//       const settings = await AppSetting.findAll();
//       res.json({ success: true, settings });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },

//   updateSetting: async (req, res) => {
//     try {
//       const { key } = req.params;
//       const { value } = req.body;
//       await AppSetting.update({ value }, { where: { key } });
//       res.json({ success: true, message: 'Setting updated' });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// };

// // adminFinanceController.js

// const { Subscription, Refund } = require('../models');

// module.exports = {
//   getRevenue: async (req, res) => {
//     try {
//       const revenue = await Subscription.sum('amount');
//       res.json({ success: true, revenue });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },

//   processRefund: async (req, res) => {
//     const { userId, amount, reason } = req.body;
//     try {
//       const refund = await Refund.create({ userId, amount, reason });
//       res.json({ success: true, refund });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// };

// // adminSupportController.js

// const { SupportTicket, Faq } = require('../models');

// module.exports = {
//   getTickets: async (req, res) => {
//     try {
//       const tickets = await SupportTicket.findAll({ order: [['createdAt', 'DESC']] });
//       res.json({ success: true, tickets });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },

//   resolveTicket: async (req, res) => {
//     const { ticketId } = req.params;
//     try {
//       await SupportTicket.update({ status: 'resolved' }, { where: { id: ticketId } });
//       res.json({ success: true, message: 'Ticket resolved' });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   },

//   manageFaq: async (req, res) => {
//     const { question, answer } = req.body;
//     try {
//       const faq = await Faq.create({ question, answer });
//       res.json({ success: true, faq });
//     } catch (err) {
//       res.status(500).json({ success: false, message: err.message });
//     }
//   }
// };


// */