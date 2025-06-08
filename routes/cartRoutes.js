const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protectMiddlware } = require("../middleware/authMiddlware");

const router = express.Router();

async function getCart(userId, guestId) {
  if (userId) {
    return Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
}
// create cart
// add a product to the cart for a guest or a logedin user
router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "No Product found !" });
    }
    let cart = await getCart(userId, guestId);
    if (cart) {
      let productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += Number(quantity);
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        });
      }
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0
      );
      await cart.save();
      return res.status(200).json({ msg: "cart created", cart });
    } else {
      const newCart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      return res.status(201).json({ msg: "New Cart", newCart });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
});

// put route for cart
router.put("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;
  try {
    let cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found !!" });
    }
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );
    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = Number(quantity);
      } else {
        cart.products.splice(productIndex, 1);
      }
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0
      );
      await cart.save();
      return res.status(201).json({ msg: "Cart found !!", cart });
    } else {
      res.status(404).json({ msg: "Product not found in cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "server error" });
  }
});

// cart delete route
router.delete("/",async (req,res)=>{
    const {productId,size,color,userId,guestId} = req.body
    try {
        let cart = await getCart(userId,guestId)
        if(!cart){
            return res.status(404).json({msg : "Cart Not found"})
        }
        const productIndex = cart.products.findIndex((p)=> p.productId.toString() === productId && p.size === size && p.color === color)
        if(productIndex > -1){
            cart.products.splice(productIndex,1)
            cart.totalPrice = cart.products.reduceRight((acc,item)=> acc + Number(item.price) * Number(item.quantity),0)
            await cart.save()
            return res.status(200).json({msg : "cart foound",cart})
        }else{
            return res.status(404).json({msg : "product not foun din the cart"})
        }
    } catch (error) {
        res.status(500).json("server error")
    }
})


// get logged i user or guest user cart
router.get("/",async (req,res)=>{
    const {userId,guestId} = req.query;
    try {
        const cart = await getCart(userId,guestId)
        if(cart){
            res.status(200).json({msg : "Cart found",cart})
        }else{
            res.status(404).json({msg : "Cart not found!!"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({msg : "server error"})
    }
})

// merge route
router.post("/merge",protectMiddlware,async (req,res)=>{
  const {guestId} = req.body;
  try {
    const guestCart = await Cart.findOne({guestId})
    const userCart = await Cart.findOne({user : req.user._id})
    if(guestCart){
      if(guestCart.lenght === 0){
        return res.status(400).json({msg : "Cart Not Found !"})
      }
      if(userCart){
        guestCart.products.forEach((productItem)=>{
          const productIndex = userCart.products.findIndex((items)=> items.productId.toString() === productItem.productId.toString() && items.size === guestItem.size && items.color === guestItem.size)
          if(productIndex > -1){
            userCart.products[productIndex].quantity += Number(guestItem.quantity)
          }else{
            userCart.products.push(guestItem)
          }
        })
        userCart.totalPrice = userCart.products.reduce((acc,item)=> acc + Number(item.price) * Number(item.quantity),0)
        await userCart.save()

        // remove the guest cart after merging
        try {
          await Cart.findOneAndDelete({guestId})
        } catch (error) {
          console.log(error,"error deleting guest cart")
        }
        res.status(200).json(userCart)
      }else{
        guestCart.user = req.user._id;
        guestCart.guestId = undefined;
        await guestCart.save();
        res.status(200).json(guestCart)
      }
    }else{
      if(userCart){
        return res.status(200).json(userCart)
      }
      res.status(404).json({msg : "Guest cart not found !!!"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({msg : "Internal server error !!"})
  }
})

module.exports = router;
