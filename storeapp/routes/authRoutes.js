const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = "SECRET123";

// ===============================
// REGISTER (Store Only)
// ===============================
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
      status: "pending"
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

// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "No user" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    // 🔥 Store status check
    if (admin.role === "store") {

      if (admin.status === "pending") {
        return res.status(403).json({ msg: "Store not approved yet" });
      }

      if (admin.status === "suspended") {
        return res.status(403).json({ msg: "Store suspended by platform" });
      }
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET
    );

    res.json({
      token,
      role: admin.role,
      status: admin.status
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;