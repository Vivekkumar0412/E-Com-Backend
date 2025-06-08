const express = require("express")
const Product = require("../models/Product")
const  { protectMiddlware, isAdminMiddleware } = require("../middleware/authMiddlware");

const router = express.Router()

// get all the products
router.get("/",protectMiddlware,isAdminMiddleware, async (req,res)=>{
    try {
        const products = await Product.find();
        if(products){
            res.status(200).json({msg : "Found all the products !!",products})
        }else{
            res.status(404).json({msg : "No product found"})
        }
    } catch (error) {
        res.status(500).json({msg : "Internal server error"})   
    }
})

module.exports = router;