const mongoose = require("mongoose");

const userDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  deviceDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessed: { type: Date, default: Date.now },
});

const UserDevice = mongoose.model("UserDevice", userDeviceSchema);

module.exports = UserDevice;
