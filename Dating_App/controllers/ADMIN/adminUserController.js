// adminUserController.js
// Description: Admin functionalities related to user management

//const { User, Report, LoginHistory } = require('../models');
const User = require('../../models/User');
const Report = require('../../models/Report');
const LoginHistory = require('../../models/LoginHistory');
const { Parser } = require('json2csv');
const path = require('path'); 
const fs = require('fs');


const { Op } = require('sequelize');

module.exports = {
  // ✅ Get all users (with filtering & pagination)
  getAllUsers: async (req, res) => {
    const { search, status, verified, page = 1, limit = 20 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (verified) where.verified = verified === 'true';

    const offset = (page - 1) * limit;

    try {
      const { rows, count } = await User.findAndCountAll({
        where,
        offset,
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      return res.json({
        success: true,
        totalUsers: count,
        currentPage: parseInt(page),
        users: rows
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getUserById: async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Delete user
  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await User.destroy({ where: { id: userId } });

      if (result === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  
  // ✅ Suspend or ban user
  suspendUser: async (req, res) => {
    const { userId } = req.params;
    try {
      await User.update({ status: 'suspended' }, { where: { id: userId } });
      res.json({ success: true, message: 'User suspended.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Verify user manually
  verifyUser: async (req, res) => {
    const { userId } = req.params;
    try {
      await User.update({ verified: true }, { where: { id: userId } });
      res.json({ success: true, message: 'User verified successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ View user’s report history
  getUserReports: async (req, res) => {
    const { userId } = req.params;
    try {
      const reports = await Report.findAll({
        where: { reportedUserId: userId },
        order: [['createdAt', 'DESC']]
      });

      res.json({ success: true, reports });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

// ✅ View user login history
// ✅ View user login history
 getLoginHistory : async (req, res) => {
  const { userId } = req.params;
  try {
    const history = await LoginHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, loginHistory: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},


 // ✅ Search users by name, email, or ID
 searchUsers: async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { id: { [Op.like]: `%${query}%` } }
        ]
      }
    });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

// ✅ Filter users by status (Active, Banned, Pending)
// ✅ Filter users by status (Active, Banned, Pending)
filterUsers: async (req, res) => {
  const { status } = req.body;

  // Validate if status is provided and is a valid status
  const validStatuses = ['active', 'banned', 'pending'];
  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Invalid or missing status parameter. Accepted values: active, banned, pending.' });
  }

  try {
    const users = await User.findAll({
      where: { status: status.toLowerCase() }
    });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

// ✅ Sort users based on criteria (Join Date, Last Active, Verification Status)
sortUsers: async (req, res) => {
  const { sort } = req.body;  // Changed from query to body for consistency
  console.log("Received sort parameter:", sort);  // Debugging log

  // Define valid columns that are allowed for sorting
  const validSortColumns = ['createdAt', 'lastActive', 'verified'];

  if (!sort || !validSortColumns.includes(sort)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid sort parameter. Accepted values: createdAt, lastActive, verified.' 
    });
  }

  try {
    const users = await User.findAll({
      order: [[sort, 'DESC']]
    });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},


// ✅ Approve all pending users
approveAllPendingUsers: async (req, res) => {
  try {
    await User.update({ verified: true }, { where: { verified: false } });
    res.json({ success: true, message: 'All pending users approved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

// ✅ Ban multiple users
banMultipleUsers: async (req, res) => {
  const { userIds } = req.body;
  try {
    await User.update({ status: 'banned' }, { where: { id: userIds } });
    res.json({ success: true, message: 'Selected users banned.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

// ✅ Export user list to CSV
// ✅ Export user list to CSV
exportToCSV: async (req, res) => {
  try {
    const users = await User.findAll();
    const userData = users.map(user => ({
      id: user.id,
      name: user.firstName,
      email: user.email,
      status: user.status,
      verified: user.verified,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    }));

    const parser = new Parser(); // Make sure Parser is imported from 'json2csv'
    const csv = parser.parse(userData);

    // Save CSV file to the 'exports' folder
    const filePath = path.join(__dirname, '../../exports/users.csv');
    fs.writeFileSync(filePath, csv);

    // Send file for download
    res.download(filePath, 'users.csv');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

// ✅ Get verification status
getVerificationStatus: async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, verified: user.verified });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},

// ✅ Manual verification of a user
manualVerification: async (req, res) => {
  const { userId } = req.params;
  try {
    await User.update({ verified: true }, { where: { id: userId } });
    res.json({ success: true, message: 'User verified manually.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
},
};