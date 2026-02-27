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

module.exports = router;