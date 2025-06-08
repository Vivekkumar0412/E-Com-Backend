const express = require("express");
const User = require("../models/User");
const {
  isAdminMiddleware,
  protectMiddlware,
} = require("../middleware/authMiddlware");

const router = express.Router();

// get all users
router.get("/", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ msg: "found all the users", users });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// create a new user (only admin can)
router.post("/", protectMiddlware, isAdminMiddleware, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) {
      res.status(400).json({ msg: "user alredy exist" });
    }
    user = new User({
      name,
      email,
      password,
      role: role || "customer",
    });

    await user.save()
    res.status(201).json({msg : "user created sucessfully",user})
  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: "Internal server error" });

  }
});

// update 
router.put("/:id",protectMiddlware,isAdminMiddleware,async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(user){
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
        }
        const updatedUser = await user.save();
        res.status(200).json({msg : "user updated sucessfully",updatedUser})
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Internal server error" });
    }
})


// delete route
router.delete("/:id",protectMiddlware,isAdminMiddleware,async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(user){
            await user.deleteOne();
            res.status(200).json({msg : "user deleted sucessfully"})
        }else{
            res.status(404).json({msg : "user does not exist"})
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
})
module.exports = router;
