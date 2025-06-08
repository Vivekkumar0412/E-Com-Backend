const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {protectMiddlware} = require("../middleware/authMiddlware");
const router = express.Router();

//  user register route
router.post("/register", async (req, res) => {
  const { name, email, password,role } = req.body;
  try {
    // res.send({name,email,password})
    let user = await User.findOne({ email: email });
    console.log(user, "before");
    if (user) {
      console.log(user, "if");
      return res.status(400).json({ msg: "User alredy exists" });
    }
    user = new User({ name, email, password,role });
    await user.save();

    // jwt payload
    const payload = { user: { id: user._id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          msg: "User created",
          user,
          Token: token,
        });
      }
    );
    console.log(user, "after");
    // res.status(201).json({msg : "User created ",user})
  } catch (error) {
    res.status(400).json({ msg: error });
  }
});

// Login route
router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credientials" });
    const isMatchPass = await user.isPasswordMatch(password);
    if (!isMatchPass) {
      return res.status(404).json({ msg: "Invalid password" });
    }
    let payload = { user: { id: user._id, role: user.role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "40h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          msg: "Login sucessfull",
          user,
          Token: token,
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// get user profile router
router.get("/profile", protectMiddlware, async (req, res) => {
  res.send(req.user);
});
module.exports = router;
