require("dotenv").config(); // Ensure dotenv is loaded

const { createClient } = require('redis');

// Create Redis client
const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',  // Explicitly set IPv4 localhost
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,  // Default to 6379
  },
  password: process.env.REDIS_PASSWORD || '', // Optional password
});

// Redis connection events
client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to the Redis server
(async () => {
  try {
    await client.connect();
    console.log('Redis client connected successfully');
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();

// Export the client
module.exports = client;
