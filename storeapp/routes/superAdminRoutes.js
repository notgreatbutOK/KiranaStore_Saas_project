const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const superAdmin = require("../middleware/superAdminMiddleware");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");

// Get all stores
router.get("/stores", auth, superAdmin, async (req, res) => {
  try {
    const stores = await Admin.find({ role: "store" }).select("-password");
    res.json(stores);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get total platform revenue (cash only)
router.get("/revenue", auth, superAdmin, async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $match: { paymentType: "cash" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    res.json(result[0] || { totalRevenue: 0 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Approve Store
router.patch("/approve/:storeId", auth, superAdmin, async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.params.storeId, { status: "active" });
    res.json({ msg: "Store approved successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Suspend Store
router.patch("/suspend/:storeId", auth, superAdmin, async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.params.storeId, { status: "suspended" });
    res.json({ msg: "Store suspended successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete Store
router.delete("/delete/:storeId", auth, superAdmin, async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.storeId);
    res.json({ msg: "Store deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Reset Store Password
router.patch("/reset-password/:storeId", auth, superAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 10);
    await Admin.findByIdAndUpdate(req.params.storeId, { password: hash });
    res.json({ msg: "Password reset successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Activate subscription
router.patch("/subscribe/:storeId", auth, superAdmin, async (req, res) => {
  try {
    const { plan } = req.body;
    const planDays = {
      "1month": 30,
      "3months": 90,
      "6months": 180,
      "1year": 365
    };
    if (!planDays[plan]) return res.status(400).json({ msg: "Invalid plan" });
    const subscriptionEndDate = new Date(Date.now() + planDays[plan] * 24 * 60 * 60 * 1000);
    await Admin.findByIdAndUpdate(req.params.storeId, { subscriptionPlan: plan, subscriptionEndDate });
    res.json({ msg: `${plan} subscription activated!` });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Remove subscription
router.patch("/removeplan/:storeId", auth, superAdmin, async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.params.storeId, {
      subscriptionPlan: "trial",
      subscriptionEndDate: null,
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    res.json({ msg: "Plan removed, trial reset" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;