const mongoose = require("mongoose");

const historyPaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    required: true,
    ref: "User", // Assuming you have a User model
  },
  amount: {
    type: Number,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "INR",
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "UPI"],
    default: "UPI",
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  transactionId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update `updatedAt` before saving
historyPaymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Paymenthistory", historyPaymentSchema);
