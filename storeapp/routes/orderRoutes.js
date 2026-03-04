const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const { createOrder, getMyOrders } = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/", auth, getMyOrders);

// Update order status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;