const jwt = require('jsonwebtoken');
const redis = require('../src/redis'); // Adjust path if necessary
const User = require('../models/User');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

// 🔢 Generate 6-digit OTP (if you need it for other functionalities)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 🔄 Generate Tokens (Access & Refresh) During Login
const generateToken = async (req, res) => {
  const { mobile, email, username } = req.body;

  if (!mobile && !email && !username) {
    return res.status(400).json({ message: 'Mobile number, email, or username is required.' });
  }

  try {
    // Search for the user by phoneNumber, email, or username
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phoneNumber: mobile },
          { email: email },
          { username: username }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        messages: ["User not found with provided credentials."],
        data: {},
      });
    }

    console.log("✅ User Found:", user);  // Debugging line to confirm user retrieval

    // Generate Access Token
    const accessToken = jwt.sign(
      { userId: user.id.toString(), role: user.role },  // ✅ Include `userId` properly
      process.env.ACCESS_TOKEN_SECRET || "access_secret_key",
      { expiresIn: '15m' }
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: user.id.toString(), role: user.role },  // ✅ Include `userId` properly
      process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key",
      { expiresIn: '7d' }
    );

    // Store refresh token in Redis
    await redis.set(`refresh_token:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7); // 7 days

    return res.status(200).json({
      statusCode: 200,
      success: true,
      messages: ["Login successful"],
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error generating tokens:', error.message);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      messages: ["Internal server error"],
      error: error.message,
      data: {},
    });
  }
};




// 🔄 Refresh Access Token using Refresh Token
const refreshAccessToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      messages: ["Refresh token is required."],
      data: {},
    });
  }

  try {
    // Check if the refresh token is blacklisted
    const isBlacklisted = await redis.get(`blacklisted_refresh_token:${refresh_token}`);
    if (isBlacklisted) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        messages: ["Token has been blacklisted and is no longer valid."],
        data: {},
      });
    }

    // Verify Refresh Token
    const payload = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET);

    // Check if the refresh token is stored in Redis
    const storedToken = await redis.get(`refresh_token:${payload.userId}`);
    if (storedToken !== refresh_token) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        messages: ["Invalid refresh token."],
        data: {},
      });
    }

    // Blacklist old refresh token
    await redis.set(`blacklisted_refresh_token:${refresh_token}`, 'true', 'EX', 60 * 60 * 24 * 7); // 7 days

    const user = await User.findByPk(payload.userId);
    if (!user) throw new Error("User not found");

    // Generate New Access Token
    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // Generate New Refresh Token
    const newRefreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Store the new refresh token in Redis
    await redis.set(`refresh_token:${user.id}`, newRefreshToken, 'EX', 60 * 60 * 24 * 7); // 7 days expiry

    return res.status(200).json({
      statusCode: 200,
      success: true,
      messages: ["Access and refresh tokens refreshed successfully."],
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    return res.status(403).json({
      statusCode: 403,
      success: false,
      messages: ["Invalid or expired refresh token."],
      error: error.message,
      data: {},
    });
  }
};

module.exports = {
  generateOTP,
  generateToken,
  refreshAccessToken,
};
