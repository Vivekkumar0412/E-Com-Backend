const express = require("express");
const Order = require("../models/Order");
const {protectMiddlware} = require("../middleware/authMiddlware");


const router = express.Router();
// get logged in users orrders

router.get("/my-orders",protectMiddlware,async (req,res)=>{
    try {
        const userId  = req.user._id;
        const orders = await Order.find({user : userId}).sort({
            createdAt : -1
        })
        res.status(201).json({msg  : "orders found !!",orders})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg : "Internal server error"})
    }
})

// order details by id

router.get("/:id",protectMiddlware, async (req,res)=>{
    try {
        const order = await Order.findById(req.params.id).populate("user","name");
        if(!order){
            res.status(404).json({msg  :"order not found"})
        }
        res.status(200).json({msg  :"full order found",order})

    } catch (error) {
        console.log(error)
        res.status(500).json({msg : "internal server error"})
    }
})


module.exports = router