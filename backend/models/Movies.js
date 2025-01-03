const mongoose = require("mongoose"); // Use mongoose, not mongodb
const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    genre: { type: String },
    poster: {
      url: { type: String },
    },
    releaseYear: {
      type: String,
    },
    director: {
      type: String,
    },
    resolutions: [
      {
        chunk: { type: String },
        quality: { type: String },
        url: { type: String },
      },
    ],
    trailer: [
      {
        chunk: { type: String },
        quality: { type: String },
        url: { type: String },
      },
    ],
    publish: {
      type: String,
      default: "false",
    },

    status: {
      type: String,
      enum: [
        "queued",
        "processing",
        "completed",
        "video completed",
        "waiting_for_video",
      ],
      default: "queued",
    },
    uploadedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Export the schema model
module.exports = mongoose.model("Movie", movieSchema);
