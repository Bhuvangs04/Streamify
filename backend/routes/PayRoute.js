const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const nodemailer = require("nodemailer");
const userSchema = require("../models/User");
const paymentSchema = require("../models/Payment");
const RefundSchema = require("../models/RefundDetails");
const payHistorySchema = require("../models/payhistory");
const PlanSchema = require("../models/PaymentSchema");
const axios = require("axios");
const { verifyToken, verifyAdmin } = require("../middleware/verify");
const checkAdmin = require("../middleware/Admin");
require("dotenv").config();



router.post("/plans/new", verifyToken,verifyAdmin,checkAdmin, async (req, res) => {
  const userId = req.user.userId;
  try {
    const {id,name,price,month,description,devices} = req.body;
    if(!id || !name || !price || !month || !description || !devices){
      return res.status(400).json({message:"All fields are required"});
    }
    const plan = new PlanSchema({
      id,
      name,
      price,
      month,
      description,
      devices,
      userId,
    });
    await plan.save();
    return res.status(201).json({message:"Plan added successfully"});
  } catch (error) {
    return res.status(500).json({message:"Internal server error"});
  }
});

router.get("/plans/:plan_id/createdBy", verifyToken,verifyAdmin,checkAdmin, async (req, res) => {
  const { plan_id } = req.params;
  try {
    const plan = await PlanSchema.findOne({ id: plan_id }).populate(
      "userId",
      "username role"
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    return res
      .status(200)
      .json({ createdBy: plan.userId.username, role: plan.userId.role,description:plan.description });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/update/plan/current/:plan_id", verifyToken,verifyAdmin,checkAdmin, async (req, res) => {
  const { plan_id } = req.params;
  try {
    const plan = await PlanSchema.findOne({ id: plan_id });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    const { name, price, month, description, devices } = req.body;
    if (!name || !price || !month || !description || !devices) {
      return res.status(400).json({ message: "All fields are required." });
    }
    await PlanSchema.findOneAndUpdate(
      { id: plan_id },
      { name, price, month, description, devices }
    );
    return res.status(200).json({ message: "Plan updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});



router.post(
  "/plans/:plan_id/:status",
  verifyToken,
  verifyAdmin,
  checkAdmin,
  async (req, res) => {
    const { status } = req.params;
    const { plan_id } = req.params;
    try {
      const plan = await PlanSchema.findOne({ id: plan_id });
      if (!plan) {
        return res.status(404).json({ message: "Plan not found." });
      }
      await PlanSchema.findOneAndUpdate({ id: plan_id }, { status });
      return res
        .status(200)
        .json({ message: "Plan status updated successfully." });
    } catch (error) {
            console.error("Error updating plan status:", error);

      return res.status(500).json({ message: "Internal server error" });
    }
  }
); 

router.delete("/delete/plan/:plan_id", verifyToken,verifyAdmin,checkAdmin, async (req, res) => {
  const { plan_id } = req.params;
  try {
    const plan = await PlanSchema.findOne({ id: plan_id });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }
    await PlanSchema.findOneAndDelete({ id: plan_id });
    return res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
})

router.get("/admin/plans", verifyToken, async (req, res) => {
  try {
    const plans = await PlanSchema.find().select(
      "-_id -__v -userId -createdAt"
    );
    return res.status(200).json({ plans });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/plans", verifyToken, async (req, res) => {
  try {
    const plans = await PlanSchema.find({status:true}).select("-_id -__v -userId -createdAt -status");
    return res.status(200).json({plans});
  } catch (error) {
    return res.status(500).json({message:"Internal server error"});
  }
})

// Create Razorpay order
router.post("/order", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  if (!userId) {
    return res.status(400).send({ message: "User ID not found." });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { options } = req.body;

    if (!options || !options.amount || !options.currency || !options.receipt) {
      return res.status(400).send({ message: "Invalid payment options." });
    }

    if (options.receipt) {
      const checkReceipt = await PlanSchema.findOne({
        id: options.receipt,
      });

      if (checkReceipt) {
        if (checkReceipt.status === false) {
          return res
            .status(400)
            .send({ message: "This plan no longer exists" });
        }

        if (checkReceipt.price * 100 !== options.amount) {
          return res.status(403).send({ message: "Data has been tampered" });
        }
      } else {
        return res.status(404).send({ message: "Receipt not found" });
      }
    }

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send({ message: "Failed to create order." });
    }

    const newAmount = options.amount / 100;

    // Log the order details into payment history
    const paymentHistory = new payHistorySchema({
      userId,
      orderId: order.id,
      amount: newAmount,
      currency: options.currency,
      status: "pending",
      createdAt: new Date(),
    });

    await paymentHistory.save();
    return res.json({ order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error.message || error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Validate payment
router.post("/order/validate", verifyToken, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_signature,
    razorpay_payment_id,
    Paid,
    WatchBy,
    PlanName,
    Month,
  } = req.body;

  const userId = req.user.userId;
  const name = req.user.username;
  const userEmail = await userSchema.findOne({ _id: userId }).select("email"); 
  

  try {
    const generated_signature = crypto.createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    );
    generated_signature.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = generated_signature.digest("hex");

    if (digest !== razorpay_signature) {
      await payHistorySchema.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { $set: { status: "failed", updatedAt: new Date() } }
      );
      return res.status(400).json({ message: "Transaction is not legit" });
    }

        const razorpayInstance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

    const paymentDetails = await razorpayInstance.payments.fetch(
      razorpay_payment_id
    );
    if (paymentDetails.amount !== Paid * 100) {
      await payHistorySchema.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { $set: { status: "failed", updatedAt: new Date() } }
      );
      return res.status(400).json({ message: "Amount tampered with pid" });
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
        <h2 style="color: #4CAF50;">Payment Confirmation</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for your payment! Your subscription details are as follows:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #ddd; padding: 8px;">Order ID</th>
            <td style="border-bottom: 2px solid #ddd; padding: 8px;">${razorpay_order_id}</td>
          </tr>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #ddd; padding: 8px;">Payment ID</th>
            <td style="border-bottom: 2px solid #ddd; padding: 8px;">${razorpay_payment_id}</td>
          </tr>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #ddd; padding: 8px;">Amount Paid</th>
            <td style="border-bottom: 2px solid #ddd; padding: 8px;">₹${Paid}</td>
          </tr>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #ddd; padding: 8px;">Plan Name</th>
            <td style="border-bottom: 2px solid #ddd; padding: 8px;">${PlanName}</td>
          </tr>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #ddd; padding: 8px;">Number of Devices</th>
            <td style="border-bottom: 2px solid #ddd; padding: 8px;">${WatchBy}</td>
          </tr>
          <tr>
            <th style="text-align: left; border-bottom: 2px solid #ddd; padding: 8px;">Subscription Duration</th>
            <td style="border-bottom: 2px solid #ddd; padding: 8px;">${Month}</td>
          </tr>
        </table>
        <p>Your account has been activated, and you can now enjoy unlimited streaming!</p>
        <p>If you have any questions, feel free to <a href="mailto:movie.hive.2024@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
        <p>Thank you for choosing MiniNetflix!</p>
        <p>Best regards,</p>
        <p><strong>MiniNetflix Team</strong></p>
      </div>
    `;


    await transporter.sendMail({
      to: userEmail,
      subject: "🎉 Payment Confirmation - MiniNetflix Subscription",
      text: `
        Dear ${name},

        Thank you for your payment! Your subscription details are:
        - Order ID: ${razorpay_order_id}
        - Payment ID: ${razorpay_payment_id}
        - Amount Paid: ₹${Paid}
        - Plan Name: ${PlanName}
        - Number of Devices: ${WatchBy}
        - Subscription Duration: ${Month}

        Your account has been activated, and you can now enjoy unlimited streaming!

        If you have any questions, feel free to contact us.

        Best regards,
        MiniNetflix Team
      `,
      html: message,
    });

    await payHistorySchema.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        $set: {
          status: "completed",
          transactionId: razorpay_payment_id,
          updatedAt: new Date(),
        },
      }
    );
    const payment = await paymentSchema.findOne({ userId: userId });
    const updateData = {
      PlanName,
      Month,
      Paid,
      WatchBy,
      Payment_ID: razorpay_payment_id,
      lastPaymentDate: new Date(),
    };
if (payment && payment.Refunded) {
  if (payment.Refunded === true) {
    updateData.Refunded = false;
  }
}
     
    await paymentSchema.findOneAndUpdate(
      { userId: userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    await userSchema.findByIdAndUpdate(userId, {
      lastPaymentDate: new Date(),
      userBlocked: "unBlocked",
    });

    res.json({
      msg: "Success",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error during payment validation:", error);
    res.status(500).send("Internal Server Error");
  }
});

const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw error;
  }
};

// Function to issue a refund
const refundPayment = async (paymentId, amount) => {
  try {
    const response = await axios.post(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      { amount: amount }, // Optional: refund a specific amount (in paise)
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error refunding payment:", error);
    throw error;
  }
};

router.get("/payment/full",verifyToken,verifyAdmin, async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.razorpay.com/v1/payments",
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).send("Internal Server Error");
  }
})

router.get("/payment/settlement",verifyToken,verifyAdmin, async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.razorpay.com/v1/settlements/",
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching settlements:", error);
    res.status(500).send("Internal Server Error");
  }
})

// Route to check payment details
router.get("/payment-details/:paymentId",verifyToken, async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentDetails = await checkPaymentStatus(paymentId);
    res.status(200).json({paymentDetails});
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment details." });
  }
});

router.get("/refund-status/:paymentId",verifyToken, async (req, res) => {
  const { paymentId } = req.params;

  try {
    const refundDetails = await RefundSchema.findOne({ PaymentId: paymentId });
    if (!refundDetails) {
      console.log("Refund not found for payment ID:", paymentId);
      return res.status(404).json({ message: "Refund not found." });
    }

    const refundId = refundDetails.RefundId;
    const refundStatusResponse = await axios.get(
      `https://api.razorpay.com/v1/refunds/${refundId}`,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    const userDetails = await userSchema.findOne({ _id: refundDetails.userId }); // Assuming refundDetails contains UserId
    if (!userDetails) {
      console.log("User not found for User ID:", refundDetails.userId);
      return res.status(404).json({ message: "User not found." });
    }

    const userEmail = userDetails.email; // Assuming UserSchema has an email field


    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email details
    const emailSubject = "\u2709 Refund Status Update";
    const emailBody = `
      <h4>Refund Status Update \uD83D\uDCB0</h4>
      <p>Dear Customer,</p>
      <p>We wanted to inform you about the status of your refund request:</p>
      <ul>
        <li><strong>Payment ID:</strong> ${paymentId}</li>
        <li><strong>Refund ID:</strong> ${refundId}</li>
        <li><strong>Status:</strong> ${refundStatusResponse.data.status}</li>
      </ul>
      <p>If approved, the refund should be credited to your bank account shortly.</p>
      <p>Thank you for your patience! \uD83D\uDE0A</p>
      <p>Best Regards,<br>MiniNetflix Support Team</p>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: emailSubject,
      html: emailBody,
    });

    res.status(200).json({
      message: "Refund status fetched and email sent successfully.",
      refundStatus: refundStatusResponse.data,
    });
  } catch (error) {
    console.error(
      "Error fetching refund status:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Error fetching refund status or sending email.",
      error: error.response?.data || error.message,
    });
  }
});


// Route to refund a payment
router.post("/refund/:paymentId",verifyToken,verifyAdmin, async (req, res) => {
  const { paymentId } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: "A valid refund amount is required." });
  }

  try {
    const refundDetails = await refundPayment(paymentId, amount);
    const updatedPayment = await payHistorySchema.findOneAndUpdate(
      {transactionId: paymentId },
      { status: "refunded" },
      { new: true }
    );
    if (!updatedPayment) {
      return res
        .status(404)
        .json({ message: "Payment not found in the database." });
    }
    await userSchema.findOneAndUpdate(
      { _id: updatedPayment.userId },
      { lastPaymentDate: null, userBlocked: "Blocked" }
    );
    await paymentSchema.findOneAndUpdate(
      {
        Payment_ID: paymentId,
      },
      { Refunded: true }
    );

    const refund = new RefundSchema({
      userId: updatedPayment.userId,
      PaymentId: paymentId,
      RefundId: refundDetails.id,
    });
    await refund.save();

    res.status(200).json({
      message: "Refund processed successfully.",
      refund,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      message: "An error occurred while processing the refund.",
      error: error.message || error, // Provide more details if available
    });
  }
});





// router.get("/check-payment", verifyToken, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     // Retrieve the latest payment record for the user
//     const payment = await paymentSchema
//       .findOne({ userId })
//       .sort({ lastPaymentDate: -1 }); // Get the most recent payment

//     if (!payment) {
//       return res.status(404).json({ message: "No payment record found." });
//     }

//     const { lastPaymentDate, Month } = payment;

//     // Calculate the subscription duration in days based on the `Month` field
//     const durationInDays = (() => {
//       const [value, unit] = Month.split(" ");
//       const durationMap = {
//         month: 30,
//         months: 30,
//         year: 365,
//         years: 365,
//       };
//       return parseInt(value, 10) * (durationMap[unit.toLowerCase()] || 30); // Default to 30 days
//     })();

//     // Calculate the subscription expiry date
//     const expiryDate = new Date(lastPaymentDate);
//     expiryDate.setDate(expiryDate.getDate() + durationInDays);

//     const currentDate = new Date();
//     const isExpired = currentDate > expiryDate;

//     // Retrieve user details to check the block status
//     const user = await userSchema.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Show payment reminder if the subscription is expired or the user is blocked
//     const showPaymentReminder = isExpired || user.userBlocked === "Blocked";

//     return res.json({
//       showPaymentReminder,
//     });
//   } catch (error) {
//     console.error("Error checking payment:", error);
//     res.status(500).send("Internal server error");
//   }
// });


// Check payment reminder
router.get("/check-payment", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await userSchema.findById({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found.");
    } 

    const currentDate = new Date();
    const lastPaymentDate = new Date(user.lastPaymentDate);
    const diffInDays = Math.floor(
      (currentDate - lastPaymentDate) / (1000 * 3600 * 24)
    );

    // Show payment reminder if 30 days passed or user is blocked
    if (diffInDays >= 30 || user.userBlocked === "Blocked") {
      return res.json({ showPaymentReminder: true });
    } else {
      return res.json({ showPaymentReminder: false });
    }
  } catch (error) {
    console.error("Error checking payment:", error);
    res.status(500).send("Internal server error");
  }
});


module.exports = router;
