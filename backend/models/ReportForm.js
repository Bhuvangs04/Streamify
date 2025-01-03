const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the report schema
const reportSchema = new Schema({
  // Title of the report
  title: {
    type: String,
    required: true,
    trim: true,
  },

  // Description or content of the report
  description: {
    type: String,
    required: true,
    trim: true,
  },

  // The user who submitted the report
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a "User" model
    required: true,
  },

  // Report status (could be 'pending', 'resolved', etc.)
  status: {
    type: String,
    enum: ["pending", "resolved", "closed"], // You can add other status types as needed
    default: "pending",
  },

  // Date when the report was created
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Date when the report was last updated
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Category of the report (e.g., 'bug', 'feedback', 'complaint')
  category: {
    type: String,
    enum: ["bug", "feedback", "complaint", "other"], // You can extend the categories
    required: true,
  },


  // Comments or responses to the report from admins
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // User who commented (e.g., an admin)
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Create and export the model based on the schema
const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
