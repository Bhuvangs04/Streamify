const express = require("express");
const router = express.Router();
const {verifyAdmin} = require("../middleware/verify");
const userSchema = require("../models/User");
const validator = require("validator");
const otpSchema = require("../models/Otp");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


router.use((req,res,next)=>{
  const openRoutes = ["/account", "/verify-otp", "/send-verification"];
  if(openRoutes.includes(req.path))
  {
    return next();
  }
  return verifyAdmin(req,res,next);
})

router.post("/send-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Check if an OTP already exists for the email
    let existingOtp = await otpSchema.findOne({ email });

    if (existingOtp && Date.now() < existingOtp.expiresAt) {
      return res.status(400).json({
        message:
          "An OTP was recently sent. Please wait before requesting again.",
      });
    }

    // Generate a new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // Upsert the OTP entry
    await otpSchema.findOneAndUpdate(
      { email },
      { email, otp, createdAt: new Date(), expiresAt, isVerified: false },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "movie.hive.2024@gmail.com",
        pass: "zcfyrbrxrkizdbxg",
      },
    });

    // Send OTP via email
    await transporter.sendMail({
      to: email,
      subject: "Your Verification Code 🔐",
      text: `Your verification code is: ${otp}. Please note that the OTP is valid for only 10 minutes from the generation.`,

      html: `
    <p>Your verification code is:</p>
    <h1 style="font-size: 40px; color: #007bff; font-weight: bold;">${otp}</h1> <!-- Increase font size and routerly color -->
    <p>Please note that the OTP is valid for only 10 minutes from the generation.</p>
  `,
    });
    res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email. Please try again." });
  }
});

// Route to verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    // Find the OTP entry
    const otpEntry = await otpSchema.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    // Check if OTP is valid and not expired
    const isValid = otpEntry.otp === otp;
    const isExpired = Date.now() > otpEntry.expiresAt;

    if (isExpired) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Mark OTP as verified
    otpEntry.isVerified = true;
    await otpEntry.save();

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Failed to verify OTP. Please try again." });
  }
});

router.post("/account", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }
  const newemail = validator.normalizeEmail(email);
  try {
    const usernameExists = await userSchema.findOne({ username });
    const emailExists = await userSchema.findOne({ email });
    if (usernameExists || emailExists) {
      return res
        .status(400)
        .send({ message: "Username or email already exists." });
    }
    const newUser = new userSchema({
      username,
      email: newemail,
      password,
      isEmailVerified: true,
    });
    await newUser.save();
    res.status(201).send({ message: "Account created successfully." });
  } catch (err) {
    res.status(400).send("Error creating account: " + err.message);
  }
});


router.post("/admin-account", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newAdmin = new userSchema({
      username,
      email,
      password,
      role: "admin",
    });
    await newAdmin.save();
   return res.status(201).send({message:"Admin account created successfully."});
  } catch (err) {
    res.status(400).send("Error creating admin account: " + err.message);
  }
});


module.exports = router;
