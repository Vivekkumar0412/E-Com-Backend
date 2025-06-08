const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protectMiddlware } = require("../middleware/authMiddlware");
const { checkout } = require("./cartRoutes");

const router = express.Router();
//  POST create checkout
router.post("/", protectMiddlware, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;
  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(404).json({ msg: "No items in checkout" });
  }
  try {
    const newChcekout = await Checkout.create({
      user: req.user._id,
      checkoutItems: checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });
    console.log(`checkout created for the user : ${req.user._id}`);
    res.status(201).json({ msg: "Checkout created !!", newChcekout });
  } catch (error) {
    console.log(error,"checkout error")
    res.status(500).json({ msg: "Internal server error at checkout" });
  }
});

// pay route
router.put("/:id/pay", protectMiddlware, async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;
  try {
    const checkOut = await Checkout.findById(req.params.id);
    if (!checkOut) {
      return res.status(500).json({ message: "checkout not found !!!" });
    }
    if (paymentStatus === "paid") {
      (checkOut.isPaid = true),
        (checkOut.paymentStatus = paymentStatus),
        (checkOut.paymentDetails = paymentDetails),
        (checkOut.paidAt = Date.now());

      await checkOut.save();
      res.status(200).json(checkOut);
    } else {
      return res.status(400).json({ msg: "Invalid payment status" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "server error" });
  }
});

//  finalised route
router.post("/:id/finalize", protectMiddlware, async (req, res) => {
  try {
    const checkOut = await Checkout.findById(req.params.id);
    if (!checkOut) {
      return res.status(500).json({ msg: "Checkout Not found !!" });
    }
    if (checkOut.isPaid && !checkOut.isFinalized) {
      // create the final order based on checout details
      let finalOrder = await Order.create({
        user: checkOut.user,
        orderItems: checkOut.checkoutItems,
        shippingAddress: checkOut.shippingAddress,
        paymentMethod: checkOut.paymentMethod,
        totalPrice: checkOut.totalPrice,
        isPaid: true,
        paidAt: checkOut.paidAt,
        isDelivered: false,
        paymentStatus: "paid",
        paymentDetails: checkOut.paymentDetails,
      });
      checkOut.isFinalized = true;
      checkOut.finalizedAt = Date.now();
      await checkOut.save();

      // delete the user cart
      await Cart.findOneAndDelete({ user: checkout.user });
      res.status(201).json({ msg: "final orderr created", finalOrder });
    } else if (checkout.isFinalized) {
      res.status(400).json({ msg: "checkout alredy finalised" });
    } else {
      res.status(400).json({ msg: "checkout is not paid" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error " });
  }
});

module.exports = router;
