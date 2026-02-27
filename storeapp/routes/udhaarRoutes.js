const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");
const Udhaar = require("../models/Udhaar");

// Add Credit
router.post("/credit", auth, async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    await Udhaar.create({
      storeId: req.user,
      customerId,
      amount,
      description,
      type: "credit"
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalDue: amount }
    });

    res.json({ msg: "Credit added" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add Payment
router.post("/payment", auth, async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    await Udhaar.create({
      storeId: req.user,
      customerId,
      amount,
      description,
      type: "payment"
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalDue: -amount }
    });

    res.json({ msg: "Payment recorded" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Ledger
router.get("/:customerId", auth, async (req, res) => {
  try {
    const records = await Udhaar.find({
      storeId: req.user,
      customerId: req.params.customerId
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;