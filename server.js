const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const app = express()
const userRouter = require("./routes/userRoutes")
const productRouter = require("./routes/productRoute")
const cartRouter = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRouter = require("./routes/orderRoutes");
const uploadRouter = require("./routes/uploadRoutes");
const subscribeRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const orderAdminRoutes = require("./routes/adminOrderRoutes");
const mongoConnect = require("./config/db")
app.use(express.json())
app.use(cors())
dotenv.config(); 
mongoConnect();
const PORT = 9000
console.log(process.env.PORT)
app.get("/",(req,res)=>{
    res.send("welcome to e-com backend")
})
app.post("/",(req,res)=>{
    res.send("testsss")
})
app.use("/api/users",userRouter);
app.use("/api/products",productRouter);
app.use("/api/cart",cartRouter);
app.use("/api/checkout",checkoutRoutes);
app.use("/api/orders",orderRouter);
app.use("/api/upload",uploadRouter);
app.use("/api",subscribeRoutes);
app.use("/api/admin/users",adminRoutes);
app.use("/api/admin/products",productAdminRoutes);
app.use("/api/admin/orders",orderAdminRoutes);
app.listen(process.env.PORT,()=>{
    console.log("App running on port 9000")
})