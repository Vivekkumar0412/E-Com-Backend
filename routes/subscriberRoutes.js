const express = require("express");
const Subscriber = require("../models/Subscriber");

const router = express.Router();

router.post("/subscribe",async (req,res)=>{
    const {email} = req.body;
    if(!email){
        res.status(404).json({msg : "No email found !!!"})
    }
    try {
        // check if wmail is alredy sucribed
        let subscribe = await Subscriber.findOne({email : email});
        if(subscribe){
            res.status(400).json({msg : "email is alredy subscribed"})
        }
        // create a new subscriber
        subscribe = new Subscriber({email});
        await subscribe.save();
        res.status(201).json({msg : "Subscribed successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg : "Server error",error})
    }
})

module.exports = router