const mongoose = require("mongoose")
const  mongoConnect=async()=>{
    try {
          await mongoose.connect(process.env.MONGO_URI)  
          console.log("mongo connected successfully")
    } catch (error) {
        console.log("Mongo connect failed",error)
    }
}

module.exports = mongoConnect