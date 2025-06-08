const express = require("express");
const multer = require("multer");
const cloudnary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();
const router = express.Router();

cloudnary.config({
    cloud_name : process.env.CLOUDANARY_CLOUD_NAME,
    api_key : process.env.CLOUDANARY_API_KEY,
    api_secret : process.env.CLOUDANARY_API_SECRET
})

// multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({storage})

router.post("/",upload.single("image"),async (req,res)=>{
    try {
        if(!req.file){
            res.status(400).json({msg : "no file uploaded!!"})
        }

        // function to handle the stream upload to cloudanary
        const streamUpload = (fileBuffer)=>{
            return new Promise((resolve,reject)=>{
                const stream = cloudnary.uploader.upload_stream((error,result)=>{
                    if(result){
                        resolve(result)
                    }else{
                        reject(error)
                    }
                })
                // use streamifier to convert the file buffer into stream
                streamifier.createReadStream(fileBuffer).pipe(stream);
            })
        }
        // call the stream upload function
        const result  = await streamUpload(req.file.buffer);

        // respond with uploaded image url
        res.json({imageUrl : result.secure_url})
    } catch (error) {
        console.log(error)
        res.status(500).json({msg : "server error"})
    }
})

module.exports = router