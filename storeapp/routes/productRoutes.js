const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

// ADD PRODUCT
router.post("/", auth, async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      owner: req.user,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MY PRODUCTS
router.get("/", auth, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user });
    res.json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE QUANTITY
router.patch("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity, price: req.body.price },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE PRODUCT
router.delete("/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD PRODUCT
router.post("/", auth, async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      unit: req.body.unit || "pieces",
      category: req.body.category || "General",
      owner: req.user,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;