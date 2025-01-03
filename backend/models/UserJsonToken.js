const mongoose = require("mongoose");

const JsonWebTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    // Add an expiresAt field to track expiration time
    expiresAt: {
      type: Date,
      required: true,
      default: () => Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    },
  },
  { timestamps: true } // Add createdAt and updatedAt fields automatically
);

// Create a TTL index on the expiresAt field
JsonWebTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Token", JsonWebTokenSchema);
