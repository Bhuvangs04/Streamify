const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    Paid: { type: String, required: true },
    WatchBy: { type: String, required: true },
    lastPaymentDate: { type: Date, default: Date.now, required: true },
    Payment_ID: { type: String, required: true },
    PlanName: { type: String, required: true },
    Month:{ type: String, required: true },
    Refunded:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);