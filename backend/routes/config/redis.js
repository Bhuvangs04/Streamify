const Redis = require("ioredis");

const redisClient = new Redis({
  host: "127.0.0.1", // Redis host
  port: 6379, // Default Redis port
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  connectTimeout: 10000,
});

redisClient.on("connect", () => {
  console.log("Standalone Redis connected");
});

redisClient.on("error", (err) => {
  console.error("Standalone Redis connection error:", err);
});

module.exports = redisClient;
