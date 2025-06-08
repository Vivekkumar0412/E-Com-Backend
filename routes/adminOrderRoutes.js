const express = require("express");
const Order = require("../models/Order");
const {
  protectMiddlware,
  isAdminMiddleware,
} = require("../middleware/authMiddlware");

const router = express.Router();

// get all the orders
router.get("/", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    if (orders) {
      res.status(200).json({ msg: "Found all orders", orders });
    } else {
      res.status(404).json({ msg: "No orders found !!" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// route to update the status for the order
router.put("/:id", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (order) {
      order.status = req.body.status || order.status;
      order.isDelivered =
        req.body.status === "Delivered" ? true : order.isDelivered;
      order.deliveredAt =
        req.body.status === "Delivered" ? Date.now() : order.deliveredAt;


      const updatedOrder = await order.save();
      res.status(200).json({ msg: "order updated !", updatedOrder });
    } else {
      res.status(400).json({ msg: "No order found !!" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// delete order route
router.delete("/:id", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.status(200).json({ msg: "order deleted" });
    } else {
      res.status(404).json({ msg: "Order Not found !!" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});
module.exports = router;
