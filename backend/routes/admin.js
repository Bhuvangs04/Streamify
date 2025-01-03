const express = require("express");
const nodemailer = require("nodemailer");
const { verifyToken,verifyAdmin } = require("../middleware/verify");
const userSchema = require("../models/User");
const paymentSchema = require("../models/Payment");
const RefundSchema = require("../models/RefundDetails");
const payHistorySchema = require("../models/payhistory");
const movieSchema = require("../models/Movies");
const EmailChangeLog = require("../models/Email");
const router = express.Router();
require("dotenv").config();
const redisClient = require("./config/redis");
const checkAdmin = require("../middleware/Admin");

router.get(
  "/user/email/change-logs",
  verifyToken,
  checkAdmin,
  verifyAdmin,
  async (req, res) => {
    try {
      const emailChangeLogs = await EmailChangeLog.find().populate(
        "userId",
        "username email userBlocked userTransfer"
      );
      return res.status(200).json({ emailChangeLogs });
    } catch (error) {
      console.error("Error fetching email change logs:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/refund/payment/:paymentId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { paymentId } = req.params;

      const cachedDetails = await redisClient.get(paymentId);

      if (cachedDetails) {
        console.log("Data payment details fetched from cache");
        return res.status(200).json(JSON.parse(cachedDetails)); // Parse the cached JSON string
      }
      const refund = await RefundSchema.findOne({
        PaymentId: paymentId,
      }).populate({
        path: "userId",
        select: "-password -wishlist", // Exclude 'password' and 'wishlist'
      });

      if (!refund) {
        return res.status(404).json({
          error:
            "If refund was done and It's not showing data, means we haven't got their details. Contact Razorpay support for further details.",
        });
      }

      // Extract user details
      const userDetails = refund.userId;

      const refundData = {
        success: true,
        refundDetails: {
          refundId: refund.RefundId,
          paymentId: refund.PaymentId,
          createdAt: refund.createdAt,
          status: refund.status,
        },
        userDetails: {
          username: userDetails.username,
          email: userDetails.email,
          role: userDetails.role,
          userBlocked: userDetails.userBlocked,
          createdAt: userDetails.createdAt,
          updatedAt: userDetails.updatedAt,
        },
      };

      await redisClient.setex(paymentId, 86400, JSON.stringify(refundData));

      // Respond with filtered data
      res.status(200).json(refundData);
    } catch (error) {
      console.error("Error fetching user details via payment ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


router.get("/activeUsers", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const activeUsers = await userSchema
      .find({ role: "user" })
      .select(
        "-password -wishlist -resetPasswordExpires -resetPasswordToken -failedLoginAttempts -lockUntil "
      );
    const paymentDetails = await paymentSchema
      .find()
      .select("-Payment_ID  -WatchBy -Paid");
    const paymentHitory = await payHistorySchema.find();  
    res.status(200).json({ activeUsers, paymentDetails, paymentHitory });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while fetching active users." });
  }
});

router.get("/payment-details/search", async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ error: "Search term is required." });
    }
    const results = await payHistorySchema.find({
      $or: [{ orderId: term }, { transactionId: term }],
    });

    if (results.length === 0) {
      return res.status(404).json({ message: "No matching records found." });
    }

   return res.status(200).json({payments:results});
  } catch (error) {
    console.error("Error searching payment details:", error);
    res
      .status(500)
      .json({
        error: "An error occurred while searching for payment details.",
      });
  }
});
router.post(
  "/send/inactive/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userSchema.findOne({ _id: userId }); // Use `findOne` to get a single user
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
  <p>Dear <strong>${user.username}</strong>,</p>

  <p>This is a friendly reminder that the payment for your <strong>MiniNetflix subscription</strong> is overdue.</p>

  <p>To ensure uninterrupted access to your account, please complete the payment within the next <strong>7 days</strong>.</p>

  <p>If we do not receive payment by <strong>${new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString()}</strong>, your account may be temporarily placed on hold until the balance is cleared.</p>

  <p>If you've already made the payment, please disregard this message.</p>

  <p>Should you have any questions or need assistance, feel free to <a href="mailto:movie.hive.2024@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>

  <p>Thank you for being a valued customer!</p>

  <p>Best regards,</p>
  <p><strong>MiniNetflix Team</strong></p>
`;

await transporter.sendMail({
  to: user.email,
  subject: "📅 MiniNetflix Reminder: Upcoming Payment Due 💳",
  text: `
    Dear ${user.username}, 

    This is a friendly reminder that the payment for your MiniNetflix subscription is overdue. 
    To ensure uninterrupted access to your account, please complete the payment within the next 7 days. 

    If we do not receive payment by ${new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toLocaleDateString()}, 
    your account may be temporarily placed on hold until the balance is cleared.

    If you've already made the payment, please disregard this message. 
    Should you have any questions or need assistance, feel free to contact us.

    Thank you for being a valued customer!

    Best regards, 
    MiniNetflix Team
  `,
  html: message,
});


      res.status(200).json({ message: "Reminder email sent successfully!" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while sending the email." });
    }
  }
);

router.get("/send/all/detailed/:date/fetchAll", verifyToken, verifyAdmin,async(req,res)=>{
  try {

    const userDetials = await userSchema
      .find()
      .select(
        "-password -wishlist -resetPasswordToken -resetPasswordExpires -userUpdated -failedLoginAttempts -lockUntil"
      );

      const PaymentDetails = await paymentSchema.find();
      const paymentHitory = await payHistorySchema.find();
    
     return res
       .status(200)
       .json({ userDetials, PaymentDetails, paymentHitory }); 
  } catch (error) {
    return  res
       .status(500)
       .json({ message: "An error occurred while retriving details" });
  }
});

router.post(
  "/send/:block/:userId",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { userId, block } = req.params;

      // Validate the `block` parameter
      // const validBlocks = ["Blocked", "Unblocked"];
      // if (!validBlocks.includes(block)) {
      //   return res.status(400).json({
      //     message:
      //       "Invalid block status. Allowed values are 'Blocked' or 'Unblocked'.",
      //   });
      // }
      // Find and update the user, setting the `userBlocked` field
      const user = await userSchema.findByIdAndUpdate(
        userId,
        { userBlocked: block },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        message: `User successfully ${block.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error updating user block status:", error);
      res
        .status(500)
        .json({
          message: "An error occurred while updating the user block status.",
        });
    }
  }
);

router.post("/movie/uploaded/details", verifyToken, verifyAdmin,async (req,res)=>{
  try {
   const MovieDetails = await movieSchema.find({
     $or: [
       { status: "queued" },
       { status: "processing" },
       { status: "completed" },
     ],
   });
   if(MovieDetails)
   {
    return res.status(200).json({ MovieDetails });
   }else
   {
    return res.status(203).json({message:"No Movie Found"})
   }

  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while reterival the movie." });
  }
});

router.post(
  "/analytics/details",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const totalUsers = await userSchema.countDocuments({ role: "user" });
      const blockedUsers = await userSchema.countDocuments({
        userBlocked: "Blocked",
        role: "user",
      });
      const activeUsers = totalUsers - blockedUsers;
      const paidUsers = await paymentSchema.aggregate([
        {
          $group: {
            _id: "$userId",
            totalPaid: { $sum: { $toDouble: "$Paid" } },
          },
        },
      ]);
      const totalRevenue = paidUsers.reduce(
        (acc, user) => acc + user.totalPaid,
        0
      );
      const unpaidUsers = totalUsers - paidUsers.length;
      const currentDate = new Date();
      const activeSubscriptions = await paymentSchema.countDocuments({
        lastPaymentDate: {
          $gte: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            currentDate.getDate()
          ),
        },
      });
      const expiredSubscriptions = totalUsers - activeSubscriptions;
      const monthlySubscriptions = await paymentSchema.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            subscriptions: { $sum: 1 },
          },
        },
        {
          $project: {
            month: "$_id.month",
            year: "$_id.year",
            subscriptions: 1,
            _id: 0,
          },
        },
      ]);

      res.status(200).json({
        totalUsers,
        activeUsers,
        blockedUsers,
        totalRevenue,
        paidUsers: paidUsers.length,
        unpaidUsers,
        activeSubscriptions,
        expiredSubscriptions,
        monthlySubscriptions,
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);


module.exports = router;
