const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const mongoose = require("mongoose");

router.get("/", auth, async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(req.user);

    // Total revenue
    const orders = await Order.find({ storeId: req.user });
    const cashRevenue = orders
      .filter(o => o.paymentType === "cash")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const Udhaar = require("../models/Udhaar");
    const udhaarPayments = await Udhaar.find({ storeId: req.user, type: "payment" });
    const udhaarRevenue = udhaarPayments.reduce((sum, u) => sum + u.amount, 0);
    const totalRevenue = cashRevenue + udhaarRevenue;

    // Recent orders
    const recentOrders = await Order.find({ storeId: req.user })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock products
    const lowStock = await Product.find({ owner: req.user, quantity: { $lt: 5 } });

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { storeId: storeId } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" }
    ]);

    // Total pending udhaar
    const pendingUdhaar = await Customer.aggregate([
      { $match: { storeId: storeId } },
      { $group: { _id: null, total: { $sum: "$totalDue" } } }
    ]);
    const totalPendingUdhaar = pendingUdhaar[0]?.total || 0;

    // Weekly revenue (last 7 days)
    const weeklyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = await Order.find({
        storeId: req.user,
        paymentType: "cash",
        createdAt: { $gte: date, $lt: nextDate }
      });
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      weeklyRevenue.push({
        day: date.toLocaleDateString("en-IN", { weekday: "short" }),
        revenue: dayRevenue
      });
    }

    // Cash vs Udhaar
    const totalCashOrders = orders.filter(o => o.paymentType === "cash").length;
    const totalUdhaarOrders = orders.filter(o => o.paymentType === "udhaar").length;
    const paymentSplit = [
      { name: "Cash", value: totalCashOrders },
      { name: "Udhaar", value: totalUdhaarOrders }
    ];

    // Stock levels (top 6 products)
    const stockLevels = await Product.find({ owner: req.user })
      .sort({ quantity: 1 })
      .limit(6)
      .select("name quantity");

    res.json({
      totalRevenue,
      recentOrders,
      lowStock,
      topProducts,
      totalPendingUdhaar,
      weeklyRevenue,
      paymentSplit,
      stockLevels
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;