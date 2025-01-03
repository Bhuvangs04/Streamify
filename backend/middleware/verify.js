const JWT = require("jsonwebtoken");
const Secret = "SecureOnlyPassword";
const JsonWebToken = require("../models/UserJsonToken");


async function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send({ error: "Unauthorized." });
  }
  const findToken = await JsonWebToken.findOne({ token });
  if (findToken) {
    return res
      .status(403)
      .send({ message: "Unauthorized. Please login again." });
  }
  try {
    const decoded = JWT.verify(token, Secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .send({ error: "Token expired. Please login again." });
    }
    return res.status(403).send({ error: "UnAuthorized" });
  }
}

function decodeDeviceToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Device token is missing or not valid.");
  }

  const deviceToken = authHeader.split(" ")[1];

  if (!deviceToken || typeof deviceToken !== "string") {
    return res.status(401).send("Device token is missing or not a string.");
  }

  try {
    const decoded = JWT.verify(deviceToken, Secret);
    req.deviceDetails = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Invalid or expired device token.");
  }
}



function verifyAdmin(req, res, next){
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).send({ error: "UnAuthorized" });
    }
  try {
    const decoded = JWT.verify(token, Secret);
    if (decoded.role !== "admin") {
      return res.status(403).send({message:"Access denied. Admins only."});
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({message:"Invalid token."});
  }
};

module.exports = { verifyToken, verifyAdmin, decodeDeviceToken };