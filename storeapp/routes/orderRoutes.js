const express = require("express");

const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Admin = require("../models/Admin");
const Udhaar = require("../models/Udhaar");
const { sendMessage } = require("../services/whatsappService");
const { createOrder, getMyOrders } = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/", auth, getMyOrders);

// Update order status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const store = await Admin.findById(req.user);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("customerId").populate("items.productId", "name");

    // Send WhatsApp notification when delivered
    if (status === "delivered" && order.customerId?.phone) {
      try {
        const itemsList = order.items.map(i => `• ${i.productId?.name || "Product"} x${i.quantity}`).join("\n");
        await sendMessage(
          `91${order.customerId.phone}`,
          `✅ Your order has been delivered!\n\n${itemsList}\n\nTotal: ₹${order.totalAmount}\nPayment: ${order.paymentType === "cash" ? "💵 Cash" : "📒 Udhaar"}\n\nThank you for shopping at *${store.name}* 🙏\n\nType *hi* to order again! 🛒`
        );
      } catch (e) {
        console.log("Delivery notification failed:", e.message);
      }
    }

    // Send WhatsApp notification when cancelled
    if (status === "cancelled" && order.customerId?.phone) {
      try {
        await sendMessage(
          `91${order.customerId.phone}`,
          `❌ Your order has been cancelled by *${store.name}*.\n\nPlease contact the store for more info.\n\nType *hi* to place a new order! 🛒`
        );
      } catch (e) {
        console.log("Cancellation notification failed:", e.message);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark udhaar order as paid
router.patch("/:id/pay", auth, async (req, res) => {
  try {
    const store = await Admin.findById(req.user);
    const order = await Order.findById(req.params.id).populate("customerId").populate("items.productId", "name");

    if (!order) return res.status(404).json({ msg: "Order not found" });
    if (order.paymentType !== "udhaar") return res.status(400).json({ msg: "Not an udhaar order" });
    if (order.paid) return res.status(400).json({ msg: "Already paid" });

    // Mark order as paid
    await Order.findByIdAndUpdate(req.params.id, { paid: true, paymentType: "cash" });

    // Deduct from customer due
    await Customer.findByIdAndUpdate(order.customerId._id, {
      $inc: { totalDue: -order.totalAmount }
    });

    // Add udhaar payment record
    await Udhaar.create({
      storeId: req.user,
      customerId: order.customerId._id,
      amount: order.totalAmount,
      description: `Payment received for order - ${order.items.map(i => i.productId?.name).join(", ")}`,
      type: "payment"
    });

    // Send WhatsApp notification
    if (order.customerId?.phone) {
      try {
        const itemsList = order.items.map(i => `• ${i.productId?.name || "Product"} x${i.quantity}`).join("\n");
        await sendMessage(
          `91${order.customerId.phone}`,
          `✅ Payment received!\n\n${itemsList}\n\n💰 Amount Paid: ₹${order.totalAmount}\n\nThank you for clearing your due at *${store.name}* 🙏`
        );
      } catch (e) {
        console.log("Payment notification failed:", e.message);
      }
    }

    res.json({ msg: "Payment recorded successfully!" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;