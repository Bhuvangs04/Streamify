const express = require("express");
const reportSchema = require("../models/ReportForm");
const { verifyToken, verifyAdmin } = require("../middleware/verify");
const checkAdmin = require("../middleware/Admin");
const userSchema = require("../models/User");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();


// Route for users to submit a report
router.post("/report", verifyToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ message: "Title, description, and category are required" });
    }

    // Create a new report
    const newReport = new reportSchema({
      title,
      description,
      category,
      user: req.user.userId, // Assuming req.user contains the authenticated user data
    });

    await newReport.save();

    return res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route for admins to respond to a report
router.post("/report/:reportId/comment", verifyAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { comment } = req.body;

    // Check if the comment is provided
    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Find the report by its ID
    const report = await reportSchema.findById({ _id: reportId });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if the user is an admin (you can customize this based on your authentication system)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can comment on reports" });
    }

    // Add the comment to the report
    report.comments.push({
      user: req.user.userId, // Assuming the admin is authenticated and their ID is in req.user
      comment,
    });

    await report.save();

    return res.status(200).json({
      message: "Comment added successfully",
      report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/send-email/:userId",
  verifyAdmin,
  checkAdmin,
  async (req, res) => {
    try {
      const { content } = req.body;
      const { userId } = req.params;
      
      if(content === undefined || content === null || content === "")
      {
        return res.status(400).json({ message: "Content is required" });
      }

      const user = await userSchema.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #007bff;">Hello, ${user.username}!</h2>
    <p>${content}</p>
    <p>If you have any questions, feel free to <a href="mailto:movie.hive.2024@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
    <p>Thank you,<br><strong>MiniNetflix Team</strong></p>
  </div>
`;

      await transporter.sendMail({
        to: user.email,
        subject: "📄 MiniNetflix Report Response ✅", // Added icons for better visibility
        text: content, // Plain text for fallback
        html: message, // HTML content
      });

      res.status(200).json({ message: "Email sended" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Route to get a specific report (for both users and admins to view)
router.get("/report/:reportId", verifyToken, async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await reportSchema
      .findById({ _id: reportId })
      .populate("user", "name email")
      .populate("comments.user", "name");

    const userDetails = await userSchema
      .find({ _id: report.user })
      .select(
        "-password -role -createdAt -wishlist -resetPasswordToken -resetPasswordExpires -userUpdated -failedLoginAttempts -lockUntil"
      );
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(200).json({
      report,
      userDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/update/report/:reportId/status",
  verifyToken,
  async (req, res) => {
    try {
      const { reportId } = req.params;
      const { status } = req.body;
      const report = await reportSchema.findById({ _id: reportId });
      report.status = status;

      await report.save();

      return res.status(204).json({ message: "Status updated Successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/user/reports", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reports = await reportSchema.find({ user: userId });

    if (!reports) {
      return res.status(200).json({ message: "No reports Found" });
    }
    return res.status(200).json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// Route to get all reports (for admin purposes)
router.get("/reports", verifyAdmin, checkAdmin, async (req, res) => {
  try {
    const reports = await reportSchema.find().populate("user", "name email");
    const userDetails = await userSchema
      .find({ _id: reports.user, role: "user" })
      .select(
        "-password -role -createdAt -wishlist -resetPasswordToken -resetPasswordExpires -userUpdated -failedLoginAttempts -lockUntil"
      );

    return res.status(200).json({ reports, userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
