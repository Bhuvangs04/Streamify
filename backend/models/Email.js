const mongoose = require("mongoose");

const emailChangeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  oldEmail: { type: String, required: true },
  newEmail: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmailChangeLog", emailChangeLogSchema);
