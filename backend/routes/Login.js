const express = require("express");
const validator = require("validator");
const router = express.Router();
const axios = require("axios");
const logger = require("../services/logger");
require("dotenv").config();
const userSchema = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/verify");
const { createTokenForUser } = require("../middleware/Auth");
const checkAdmin = require("../middleware/Admin");

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!validator.isEmail(email)) {
    return res.status(400).send("Invalid email format");
  }
  const sanitizedEmail = validator.normalizeEmail(email);
  const sanitizedPassword = validator.escape(password);
  try {
    const user = await userSchema.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const role = user.role;

    if (user.isAccountLocked()) {
      return res
        .status(403)
        .send({ message: "Account is locked. Try again after 15 minutes." });
    }
    const isValidPassword = await user.isPasswordCorrect(sanitizedPassword);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(401).send({ message: "Invalid credentials" });
    }
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = await createTokenForUser(user);
    const option = {
      httpOnly: true,
      secure: true,
      maxAge: 1 * 24 * 60 * 60 * 1000,
      sameSite: "Strict",
      path: "/",
    };
    res
      .status(200)
      .cookie("token", token, option)
      .json({ message: "Login successful", role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Server error");
  }
});

router.get("/verify-auth", verifyToken, async (req, res) => {
  if(req.user.userId){
   return res.status(200).json({ message: "Authenticated" });
  }else{
    return res.status(403).json({ message: "Please Enter the correct login credentails" });
  }
});


router.get("/admin/verify-auth", verifyToken, verifyAdmin, checkAdmin,async(req,res)=>{
  res.status(200).json({Authenticated:"true"});
});

module.exports = router;
