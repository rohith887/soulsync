const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
require('dotenv').config();
const { createToken, generateRefreshToken } = require('../auth/jwt');
const passport = require('../src/passport');
const UserSettings = require('../models/UserSettings');
const UserPreference = require('../models/UserPreference');

// ✅ Enhanced switchMode with lazy preference creation
const switchMode = async (req, res) => {
  const userId = req.user.id;
  const { mode } = req.body;

  if (!['date', 'bff', 'bizz'].includes(mode)) {
    return res.status(400).json({ success: false, message: "Invalid mode. Choose 'date', 'bff', or 'bizz'." });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 🔁 Switch the mode
    user.Mode = mode;
    await user.save();

    // 🧠 Lazy preference creation
    const [preference, created] = await UserPreference.findOrCreate({
      where: { userId, mode },
      defaults: {
        genderPreference: 'any',
        ageRangeMin: 20,
        ageRangeMax: 35,
        maxDistanceKm: 50,
        relationshipType: mode === 'date' ? 'relationship' : null
      }
    });

    return res.json({
      success: true,
      message: `Switched to ${mode} mode`,
      mode: user.Mode,
      preference
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to switch mode", error: err.message });
  }
};

// ✅ Signup
const signup = async (req, res) => {
    console.log("Signup request received:", req.body);
  const { email, mobile, password, firstName, lastName } = req.body;

  try {
    if (!password || (!email && !mobile)) {
      return res.status(400).json({ success: false, messages: ["Email or mobile and password are required"] });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phoneNumber: mobile }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ success: false, messages: ["User already exists with this email or mobile number"] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      phoneNumber: mobile,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user',
      isVerified: false,
      Mode: 'date'
    });

    await UserSettings.create({ userId: user.id });

    const token = createToken(user);

    res.status(201).json({
      success: true,
      messages: ["User registered successfully"],
      data: { token, user }
    });

  } catch (error) {
    res.status(500).json({ success: false, messages: ["Error during registration"], error: error.message });
  }
};

// ✅ Login
const login = async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    if (!password || (!email && !mobile)) {
      return res.status(400).json({ success: false, messages: ["Email or mobile and password are required"] });
    }

    const searchConditions = {};
    if (email) searchConditions.email = email;
    if (mobile) searchConditions.phoneNumber = mobile;

    const user = await User.findOne({
      where: { [Op.or]: [searchConditions] }
    });

    if (!user) return res.status(404).json({ success: false, messages: ["User not found"] });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, messages: ["Invalid password"] });

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, Mode: user.Mode },
      process.env.ACCESS_TOKEN_SECRET || "access_secret_key",
      { expiresIn: "1h" }
    );
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      messages: ["Login successful"],
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          Mode: user.Mode
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, messages: ["Error during login"], error: error.message });
  }
};

// ✅ OTP Request
const requestOTP = async (req, res, next) => {
  let phoneNumber = req.body.phoneNumber || req.body.phonenumber;
  phoneNumber = phoneNumber?.toString().trim();

  if (!phoneNumber) return res.status(400).json({ message: 'Valid phone number is required' });

  try {
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) return res.status(404).json({ message: 'Phone number not registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({ otp, otpExpires });
    console.log(`[DEBUG] OTP for ${phoneNumber}: ${otp}`);

    res.json({ message: 'OTP sent to your phone number' });
  } catch (err) {
    next(err);
  }
};

// ✅ Verify OTP
const verifyOTP = async (req, res, next) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) return res.status(404).json({ message: 'Phone number not registered' });

    const isExpired = user.otpExpires && user.otpExpires < new Date();
    if (user.otp !== otp || isExpired) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    await user.update({ otp: null, otpExpires: null, isVerified: true });

    const token = createToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        role: user.role,
        Mode: user.Mode
      }
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Export Controller
module.exports = {
  switchMode,
  signup,
  login,
  requestOTP,
  verifyOTP
};
