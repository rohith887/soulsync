const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // For email sending
const User = require('../models/User');
require('dotenv').config();

// Mock OTP generation (replace with SMS service in production)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

const passwordResetController = {
  // Password Reset Request (send a reset link via email)
  async passwordResetRequest(req, res) {
    const { email } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create a reset token (expires in 1 hour)
      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // You should save the token in the database for future validation, but here we're sending it directly for simplicity.
      // In production, you should store it in the database and associate it with the user record.

      // Send the reset email (using nodemailer for example)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // your email address
          pass: process.env.EMAIL_PASSWORD, // your email password
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the link below to reset your password:\n\nhttp://localhost:3000/reset-password/${resetToken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending email', error: error.message });
        }
        res.status(200).json({ message: 'Password reset link sent to your email' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Error in password reset request', error: error.message });
    }
  },

  // Reset Password (via the token from email)
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
      // Verify the reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Find the user by ID
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await user.update({ password: hashedPassword });

      res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  },
};

module.exports = passwordResetController;
