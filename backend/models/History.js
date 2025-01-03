const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  historyId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie" },
  CreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", historySchema);