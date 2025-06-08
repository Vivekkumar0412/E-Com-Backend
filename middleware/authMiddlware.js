const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protectMiddlware = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      let token = req.headers.authorization.split(" ")[1];
      const decodedData = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decodedData.user.id).select("-password");
      next();
    } catch (error) {
      console.log("token error   ", error);
      res.status(401).json({ msg: "Error In JSWT TOKEN", error });

      next();
    }
  } else {
    res.status(404).json({ msg: "no token" });
  }
};

//  isAdmin middleware to check wether its admin or not
function isAdminMiddleware(req, res, next) {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    res.status(403).json({ msg: "Only Admin can perform this action" });
  }
}

module.exports = { protectMiddlware, isAdminMiddleware };
