const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Moderator = require("../models/Moderator");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";

const createToken = (user) => {
  console.log("📌 Creating Token For User:", user);  // Add this log to check the user object
  return jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '6h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

const Auth = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(403).json({
      success: false,
      messages: ["Token missing in Authorization header"],
      data: [],
    });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log("✅ Decoded Token:", decoded);

    const userId = decoded.userId;
    if (!userId) {
      console.log('❌ User ID not found in token');
      return res.status(404).json({ error: 'User ID not found in token' });
    }
    
    const role = decoded.role || 'user';
    console.log("🔍 User ID from Token:", userId);

    let user;

    if (role === 'user') {
      user = await User.findByPk(userId);
    } else if (role === 'moderator') {
      user = await Moderator.findByPk(userId);
    } else if (role === 'admin') {
      user = await Admin.findByPk(userId);
    }

    if (!user) return res.status(404).json({ error: 'User not found in DB' });

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  createToken,
  generateRefreshToken,
  Auth
};



// // Check if user is the owner of the profile
// const isProfileOwner = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const profileId = req.user.id; // Since we're operating on the authenticated user's own profile
    
//     if (userId !== profileId) {
//       const error = new Error('Not authorized to modify this profile');
//       error.statusCode = 403;
//       throw error;
//     }
    
//     next();
//   } catch (err) {
//     if (!err.statusCode) {
//       err.statusCode = 403;
//     }
//     next(err);
//   }
// };
