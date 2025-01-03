// admin.middleware.js
const User = require("../models/User");

const checkAdmin = async (req, res, next) => {
  const userId = req.user.userId; 

  const user = await User.findById(userId);
  if (user && user.isAdmin()) {
    return next();
  } else {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin access required" });
  }
};

module.exports = checkAdmin;
