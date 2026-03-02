const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");

// Add Customer
router.post("/", auth, async (req, res) => {
  try {
    const customer = await Customer.create({
      storeId: req.user,
      name: req.body.name,
      phone: req.body.phone
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get My Customers
router.get("/", auth, async (req, res) => {
  try {
    const customers = await Customer.find({ storeId: req.user });
    res.json(customers);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE CUSTOMER
router.delete("/:id", auth, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ msg: "Customer deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;