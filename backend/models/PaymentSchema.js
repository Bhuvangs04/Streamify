const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  month: { type: String, required: true },
  description: { type: String, required: true },
  devices: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: Boolean, default: false },
});

const Plans = mongoose.model("Plans", PlanSchema);
module.exports = Plans;