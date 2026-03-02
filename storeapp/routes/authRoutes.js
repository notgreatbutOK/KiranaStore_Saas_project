const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = "SECRET123";

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await Admin.findOne({ email });
    if (exist) return res.status(400).json({ msg: "User exists" });

    const hash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hash,
      role: "store",
      status: "pending",
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subscriptionPlan: "trial"
    });

    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "No user found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    if (admin.role === "store") {
      if (admin.status === "pending") {
        return res.status(403).json({ msg: "Store not approved yet" });
      }
      if (admin.status === "suspended") {
        return res.status(403).json({ msg: "Store suspended by platform" });
      }

      // Check trial expiry
      if (admin.subscriptionPlan === "trial") {
        if (new Date() > admin.trialEndDate) {
          return res.status(403).json({ msg: "Your 14 day trial has expired. Please subscribe to continue." });
        }
      }

      // Check subscription expiry
      if (["1month", "3months", "6months", "1year"].includes(admin.subscriptionPlan)) {
        if (new Date() > admin.subscriptionEndDate) {
          return res.status(403).json({ msg: "Your subscription has expired. Please renew to continue." });
        }
      }
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET
    );

    // Calculate trial days remaining
    let trialDaysLeft = null;
    if (admin.subscriptionPlan === "trial") {
      const diff = admin.trialEndDate - new Date();
      trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.json({
      token,
      role: admin.role,
      name: admin.name,
      status: admin.status,
      subscriptionPlan: admin.subscriptionPlan,
      trialDaysLeft
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;