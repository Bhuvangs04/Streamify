const JWT = require("jsonwebtoken");
const Secret = "SecureOnlyPassword";

async function createTokenForUser(user) {
  const payload = {
    userId: user._id,
    username: user.username,
    role: user.role,
  };
  const token = JWT.sign(payload, Secret, { expiresIn: "1d" });
  return token;
}

function createTokenForDevice(device) {
  const payload = {
    userId: device.userId,
    deviceId: device.deviceId,
    userAgent: device.deviceDetails.userAgent,
    deviceType: device.deviceDetails.deviceType,
    platform: device.deviceDetails.platform,
    isActive: device.isActive,
  };
  const token = JWT.sign(payload, Secret, { expiresIn: "12hr" });
  return token;
}

module.exports = { createTokenForUser, createTokenForDevice };
