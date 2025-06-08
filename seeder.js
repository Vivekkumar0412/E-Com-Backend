const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");

dotenv.config()

mongoose.connect(process.env.MONGO_URI)

// seeder function

const seedData = async ()=>{
    try {
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        const createUser = await User.create({
            name : "admin",
            email : "admin@admin.com",
            password : "123456",
            role : "admin"
        })

        const userId = createUser._id
        let sampleProducts = products.map((prod)=>{
            return {...prod,user : userId}
        })

        await Product.insertMany(sampleProducts)
        console.log("Product data seede successfully ")
        process.exit()
    } catch (error) {
        console.log("error seedingd ata",error)
        process.exit(1)
    }
}

seedData()