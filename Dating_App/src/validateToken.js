const jwt = require('jsonwebtoken');
const redis = require('./redis');  // Import Redis client

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key';

const validateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Extract the token (Bearer <token>)

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    // Check if the access or refresh token is blacklisted in Redis
    const isAccessTokenBlacklisted = await redis.get(`blacklisted_access_token:${token}`);
    const isRefreshTokenBlacklisted = await redis.get(`blacklisted_refresh_token:${token}`);

    // If the token is blacklisted, return a 401 response
    if (isAccessTokenBlacklisted || isRefreshTokenBlacklisted) {
        console.log('Token is blacklisted!');
      } else {
        console.log('Token is NOT blacklisted.');
      }

    // Proceed with the JWT verification if the token is not blacklisted
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
      }
      
      req.user = decoded; // Attach decoded user info to request object
      next(); // Allow the request to proceed
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = validateToken;