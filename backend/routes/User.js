const express = require("express");
require("dotenv").config();
const { verifyToken, decodeDeviceToken } = require("../middleware/verify");
const router = express.Router();
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const userSchema = require("../models/User");
const paymentSchema = require("../models/Payment");
const movieSchema = require("../models/Movies");
const historyPaymentSchema = require("../models/payhistory");
const JsonWebToken = require("../models/UserJsonToken");
const userDeviceSchema = require("../models/Device");
const historySchema = require("../models/History");
const otpSchema = require("../models/Otp");
const emailChangeLogSchema = require("../models/Email");
const { createTokenForDevice } = require("../middleware/Auth");
const redisClient = require("./config/redis");

router.use((req, res, next) => {
  if (
    req.path === "/forgot-password" ||
    req.path.startsWith("/reset-password/")
  ) {
    return next();
  }
  return verifyToken(req, res, next);
});

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("500 error from the server please come back later!");
});

const generateDeviceId = () => {
  return Math.random().toString(36).substring(2, 15);
};

router.post("/start-streaming", async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  const { deviceDetails } = req.body;
  const deviceId = generateDeviceId(); // Generate unique device ID

  try {
    // If the user's role is admin, bypass all checks and send the device token
    if (userRole === "admin") {
      const newDevice = new userDeviceSchema({
        userId,
        deviceId,
        deviceDetails,
        isActive: true,
      });

      await newDevice.save();

      // Generate a device token for authentication
      const deviceToken = createTokenForDevice(newDevice);

      // Send back the token
      return res.status(200).json({ deviceToken });
    }
    const newDevice = new userDeviceSchema({
      userId,
      deviceId,
      deviceDetails,
      isActive: true,
    });

    await newDevice.save();

    // Generate a device token for authentication
    const deviceToken = createTokenForDevice(newDevice);
    const userPaymentDetails = await paymentSchema.findOne({ userId });
    if (!userPaymentDetails) {
      return res.status(200).json({
        deviceToken,
        message: "Please update the payment details. No valid payment found.",
      });
    }

    // Check if the user's last payment is within the allowed range
    const user = await userSchema.findById({ _id: userId });
    if (user.userBlocked === "Blocked") {
      return res.status(200).json({
        deviceToken,
        message: "Your account is blocked. Please update your payment details.",
      });
    }

    if (user) {
      const currentDate = new Date();
      const lastPaymentDate = new Date(user.lastPaymentDate);
      const diffInDays = Math.floor(
        (currentDate - lastPaymentDate) / (1000 * 3600 * 24)
      );

      if (diffInDays >= 35) {
        return res.status(200).json({
          deviceToken,
          message: "Your payment details are outdated. Please update them.",
        });
      }
    } else {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({
      deviceToken,
      message: "Device registered successfully. Your payment is up to date.",
    });
  } catch (err) {
    console.error("Error starting stream:", err);
    res.status(500).send("Error starting stream: " + err.message);
  }
});

router.get("/getRole", async (req, res) => {
  try {
    const role = req.user.role;
    const userID = req.user.userId;

    const userStatus = await userSchema.findOne({ _id: userID });
    const user = userStatus.userBlocked;
    return res.status(200).json({ role, user });
  } catch (error) {
    console.error("Error:", err);
    return res.status(500).send({ error: "Failed to get Role." });
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).send({ error: "Token not found." });
  }

  try {
    // Check if the token is already blacklisted
    const existingToken = await JsonWebToken.findOne({ token });

    if (existingToken) {
      return res.status(200).send({ message: "Token already blacklisted." });
    }

    // Store the token in the database (blacklist it)
    const blacklistedToken = new JsonWebToken({
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expiration set to 24 hours
    });

    // Save the blacklisted token
    await blacklistedToken.save();

    // Clear the token cookie from the client
    res.clearCookie("token");

    return res.status(200).send({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(500).send({ error: "Failed to logout." });
  }
});

router.post("/stop-streaming", decodeDeviceToken, async (req, res) => {
  const { userId, deviceId } = req.deviceDetails;
  //console.log(req.deviceDetails);
  const authenticatedUserId = req.user.userId;
  if (userId !== authenticatedUserId) {
    return res
      .status(403)
      .send("User does not have permission to stop this device.");
  }
  try {
    const userDevice = await userDeviceSchema.findOne({ userId, deviceId });
    if (!userDevice) {
      return res.status(404).send("Device not found.");
    }
    userDevice.isActive = false;
    await userDevice.save();
    return res
      .status(200)
      .send({ message: "Device removed from active streaming." });
  } catch (err) {
    res.status(500).send("Error stopping stream: " + err.message);
  }
});

router.get("/history", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const history = await historySchema.findOne({ userId: userId });
    const movies = await movieSchema.find({
      _id: { $in: history.historyId },
    });
    res.status(200).json({ success: true, movies });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while fetching user details." });
  }
});

router.get("/active-devices", async (req, res) => {
  const userId = req.user.userId;

  try {
    const activeDevices = await userDeviceSchema.find({
      userId,
      isActive: true,
    });

    const WatchBy = await paymentSchema
      .find({ userId })
      .select("-userId -Payment_ID");

    return res.status(200).json({ activeDevices, WatchBy });
  } catch (err) {
    res.status(500).send("Error fetching active devices: " + err.message);
  }
});

router.post("/update/password", async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).send("Old and new password are required.");
  }
  try {
    const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found.");
    }
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch) {
      return res.status(400).send({ message: "Old password is incorrect." });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).send("Error while updating password: " + err.message);
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Send email with the reset link
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: "🔑 MiniNetflix Password Reset Request 🔒",
      text: `You are receiving this email because you (or someone else) requested a password reset. Please use the link below to reset your password:\n\n${resetUrl}. If you did not request this, please ignore the message.`,
      html: `
    <p>You are receiving this email because you (or someone else) requested a password reset.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; margin: 10px 0; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this message.</p>
    <p>Thank you,<br>MiniNetflix Team</p>
  `,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userSchema.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-verification", async (req, res) => {
  const userId = req.user.userId;
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length !== 2) {
    return res
      .status(400)
      .json({ message: "Two email addresses are required." });
  }

  try {
    const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.email !== emails[0]) {
      return res
        .status(400)
        .json({ message: "Current email does not match the user's email." });
    }

    const [currentEmail, newEmail] = emails;
    const responses = [];

    // Function to handle OTP generation and sending
    const sendOtpToEmail = async (email) => {
      try {
        // Check if an OTP already exists for the email
        let existingOtp = await otpSchema.findOne({ email });

        if (existingOtp && Date.now() < existingOtp.expiresAt) {
          return {
            email,
            message:
              "An OTP was recently sent. Please wait before requesting again.",
          };
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
            <h1 style="font-size: 40px; color: #007bff; font-weight: bold;">${otp}</h1>
            <p>Please note that the OTP is valid for only 10 minutes from the generation.</p>
          `,
        });

        return { email, message: "Verification email sent successfully." };
      } catch (error) {
        console.error(`Error processing OTP for ${email}:`, error);
        return { email, message: "Failed to send OTP. Please try again." };
      }
    };

    // Send OTP to both emails sequentially
    for (const email of [currentEmail, newEmail]) {
      const response = await sendOtpToEmail(email);
      responses.push(response);
    }

    res.status(200).json({ messages: responses });
  } catch (error) {
    console.error("Error sending verification emails:", error);
    res
      .status(500)
      .json({ message: "Failed to send emails. Please try again." });
  }
});

// Route to verify OTP
router.post("/verify-transfer-otp", async (req, res) => {
  const { currentEmail, currentOtp, newEmail, newOtp } = req.body;

  if (!currentEmail || !currentOtp || !newEmail || !newOtp) {
    return res.status(400).json({
      message:
        "Current email, current OTP, new email, and new OTP are required.",
    });
  }

  try {
    // Validate OTP for the current email
    const currentOtpEntry = await otpSchema.findOne({ email: currentEmail });
    if (!currentOtpEntry || currentOtpEntry.otp !== currentOtp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP for current email." });
    }
    if (Date.now() > currentOtpEntry.expiresAt) {
      return res
        .status(400)
        .json({ message: "OTP for current email has expired." });
    }

    // Validate OTP for the new email
    const newOtpEntry = await otpSchema.findOne({ email: newEmail });
    if (!newOtpEntry || newOtpEntry.otp !== newOtp) {
      return res.status(400).json({ message: "Invalid OTP for new email." });
    }
    if (Date.now() > newOtpEntry.expiresAt) {
      return res
        .status(400)
        .json({ message: "OTP for new email has expired." });
    }

    // Mark both OTPs as verified
    currentOtpEntry.isVerified = true;
    newOtpEntry.isVerified = true;
    await currentOtpEntry.save();
    await newOtpEntry.save();

    res.status(200).json({ message: "Both OTPs verified successfully." });
  } catch (error) {
    console.error("Error verifying transfer OTPs:", error);
    res.status(500).json({
      message: "Failed to verify transfer OTPs. Please try again.",
    });
  }
});

router.post("/update/transfer/currentuser", async (req, res) => {
  const userId = req.user.userId;
  const { currentEmail, newEmail } = req.body;

  if (!currentEmail || !newEmail) {
    return res.status(400).json({
      message: "Current email and new email are required.",
    });
  }

  try {
    // Verify if the OTPs are marked as verified
    const currentOtpEntry = await otpSchema.findOne({ email: currentEmail });
    const newOtpEntry = await otpSchema.findOne({ email: newEmail });

    if (!currentOtpEntry || !currentOtpEntry.isVerified) {
      return res.status(400).json({
        message: "OTP for current email is not verified.",
      });
    }
    if (!newOtpEntry || !newOtpEntry.isVerified) {
      return res.status(400).json({
        message: "OTP for new email is not verified.",
      });
    }

    // Get the current user
    const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the user hasn't updated their email within the past month
    const now = new Date();
    // const oneMonthAgo = new Date();
    // oneMonthAgo.setMonth(now.getMonth() - 1);

    // if (user.userTransfer && user.userTransfer > oneMonthAgo) {
    //   return res.status(403).json({
    //     message:
    //       "You can transfer your account to another email only once a month.",
    //   });
    // }

    // Log the email change
    const emailChangeLog = new emailChangeLogSchema({
      userId,
      oldEmail: user.email,
      newEmail: newEmail,
    });
    await emailChangeLog.save();

    // Update the user's email and record the update
    user.email = newEmail;
    user.userTransfer = now;
    await user.save();

    // Clean up the OTP entries
    await otpSchema.deleteOne({ email: currentEmail });
    await otpSchema.deleteOne({ email: newEmail });

    return res
      .status(200)
      .json({ message: "Account transferred successfully." });
  } catch (error) {
    console.error("Error transferring account:", error);
    res.status(500).json({
      message: "Error transferring account. Please try again later.",
    });
  }
});

router.post("/update/user", async (req, res) => {
  const userId = req.user.userId;
  const { username } = req.body;
  try {
    const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    if (user.userUpdated && user.userUpdated > oneMonthAgo) {
      return res.status(403).json({
        message: "You can change your name only once in a month.",
      });
    }

    // Check if the email already exists and is not the current user's email
    if (username) {
      const existingUser = await userSchema.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Username already in use." });
      }
      user.username = username;
    }

    //Update the lastUpdated field
    user.userUpdated = now;

    // Save the updated user
    await user.save();
    res.status(202).json({ Message: "Success" });
  } catch (err) {
    res.status(500).json({ message: "Error while updating: " + err.message });
  }
});

router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    try {
      // Check Redis cache first
      const cachedUser = await redisClient.get(userId);
      if (cachedUser) {
        console.log("Hit from Redis cache");
        return res
          .status(200)
          .json({ message: "Success", userDetails: JSON.parse(cachedUser) });
      }

      // Fetch from DB if not in cache
      const explain = await userSchema
        .findOne({ _id: userId })
        .select(
          "-password -resetPasswordExpires -resetPasswordToken -role -wishlist -failedLoginAttempts -lockUntil"
        )
        .lean();

      // Fetch the user details
      const userDetails = await userSchema
        .findOne({ _id: userId })
        .select(
          "-password -resetPasswordExpires -resetPasswordToken -role -wishlist -failedLoginAttempts -lockUntil"
        )
        .lean();

      if (!userDetails) {
        return res.status(404).json({ message: "User Not Found" });
      }

      // Cache the user details for future requests
      await redisClient.setex(userId, 60, JSON.stringify(userDetails));

      return res.status(200).json({ message: "Success", userDetails });
    } catch (err) {
      console.error("Error fetching profile:", err);
      return res
        .status(500)
        .json({ message: "Error fetching profile", error: err.message });
    }
  })
);

router.get("/payment-details/:userId/:date/final", async (req, res) => {
  const { userId } = req.params;
  const token_UserId = req.user.userId;
  try {
    if (userId !== token_UserId) {
      return res.status(403).json({
        message: "User does not have permission to view payment details.",
      });
    }
    const payment = await historyPaymentSchema.find({ userId });
    return res.status(200).json({ message: "Success", payment });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while fetching user details." });
  }
});

router.post("/:movieId/wishlist", async (req, res) => {
  const userId = req.user.userId;
  const { movieId } = req.params;
  try {
    const user = await userSchema.findOne({ _id: userId });
    const movie = await movieSchema.findOne({ _id: movieId });
    if (!user || !movie) {
      return res.status(404).send("User or Movie not found");
    }
    if (user.role !== "user") {
      return res.status(403).send("Admins cannot have wishlists");
    }

    if (!user.wishlist.includes(movieId)) {
      user.wishlist.push(movieId);
      await user.save();
    }
    res.status(200).json({ message: "Movie added to wishlist" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding movie to wishlist: " + err.message });
  }
});

router.get("/get-movies-wishlist", async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.wishlist || user.wishlist.length === 0) {
      return res
        .status(204)
        .json({ message: "Wishlist is empty or movie not found" });
    }

    const movies = await movieSchema.find({ _id: { $in: user.wishlist } });
    return res.status(200).json({ message: "Success", movies });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error removing movie from wishlist: " + err.message });
  }
});

router.delete("/:movieId/wishlist", async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.userId; // Assuming the user ID is in the token payload

  try {
    // Find the user by ID
    const user = await userSchema.findById({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.wishlist || user.wishlist.length === 0) {
      return res.status(400).send("Wishlist is empty or movie not found");
    }

    if (user.wishlist.includes(movieId)) {
      // Remove the movie from the wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== movieId.toString()
      );
      await user.save();
      res.status(200).json({ message: "Movie deleted from wishlist" });
    } else {
      res.status(400).json({ message: "Movie not found in wishlist" });
    }
  } catch (err) {
    res.status(500).send("Error removing movie from wishlist: " + err.message);
  }
});

module.exports = router;
