const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const superAdmin = require("../middleware/superAdminMiddleware");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const Udhaar = require("../models/Udhaar");
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

// Get total platform revenue
router.get("/revenue", auth, superAdmin, async (req, res) => {
  try {
    const cashResult = await Order.aggregate([
      { $match: { paymentType: "cash" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const cashRevenue = cashResult[0]?.total || 0;

    const udhaarResult = await Udhaar.aggregate([
      { $match: { type: "payment" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const udhaarRevenue = udhaarResult[0]?.total || 0;

    res.json({ totalRevenue: cashRevenue + udhaarRevenue });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get single store details
router.get("/store/:storeId", auth, superAdmin, async (req, res) => {
  try {
    const Product = require("../models/Product");
    const Customer = require("../models/Customer");

    const store = await Admin.findById(req.params.storeId).select("-password");
    const products = await Product.find({ owner: req.params.storeId });
    const customers = await Customer.find({ storeId: req.params.storeId });
    const orders = await Order.find({ storeId: req.params.storeId });

    const revenue = orders
      .filter(o => o.paymentType === "cash")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({ store, totalProducts: products.length, totalCustomers: customers.length, totalOrders: orders.length, revenue });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create store
router.post("/create-store", auth, superAdmin, async (req, res) => {
  try {
    const { name, email, password, mobileNumber, whatsappPhoneNumberId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const exist = await Admin.findOne({ email });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const store = await Admin.create({
      name,
      email,
      mobileNumber,
      whatsappPhoneNumberId,
      password: hash,
      role: "store",
      status: "active",
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subscriptionPlan: "trial"
    });

    res.json({ msg: "Store created!", store });
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