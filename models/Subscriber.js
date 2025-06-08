const mongoose = require("mongoose");
const subscriberSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true
    },
    suscribedAt : {
        type : Date,
        default : Date.now,
    }
})

module.exports = mongoose.model("Subcriber",subscriberSchema);