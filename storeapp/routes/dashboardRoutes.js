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
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Recent orders
    const recentOrders = await Order.find({ storeId: req.user })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Low stock products
    const lowStock = await Product.find({
      owner: req.user,
      quantity: { $lt: 5 }
    });

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { storeId: storeId } },
      { $unwind: "$items" },
      { $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }},
      { $unwind: "$product" }
    ]);

    // Total pending udhaar
    const pendingUdhaar = await Customer.aggregate([
      { $match: { storeId: storeId } },
      { $group: { _id: null, total: { $sum: "$totalDue" } } }
    ]);
    const totalPendingUdhaar = pendingUdhaar[0]?.total || 0;

    res.json({ totalRevenue, recentOrders, lowStock, topProducts, totalPendingUdhaar });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;