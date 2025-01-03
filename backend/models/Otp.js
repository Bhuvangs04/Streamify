const mongoose = require("mongoose");

// Define the OTP schema
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
});

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
