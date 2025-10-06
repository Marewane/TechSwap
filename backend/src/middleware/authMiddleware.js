const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

//
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ msg: "Invalid token" });

    next();
  } catch (error) {
    res.status(401).json({ msg: "Auth failed" });
  }
};

module.exports = auth;
