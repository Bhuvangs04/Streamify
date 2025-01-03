const mongoose = require("mongoose");

const RefundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  PaymentId: {
    type: String,
    required: true,
    unique: true,
  },
  RefundId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserDevice = mongoose.model("Refunds", RefundSchema);

module.exports = UserDevice;