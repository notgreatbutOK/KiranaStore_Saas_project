const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Udhaar = require("../models/Udhaar");

exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, paymentType } = req.body;

    let totalAmount = 0;

    // Check stock first
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ msg: "Product not found" });

      // Block if out of stock
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          msg: `Not enough stock for ${product.name}. Available: ${product.quantity}` 
        });
      }

      totalAmount += product.price * item.quantity;
      item.price = product.price;
    }

    // Deduct stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity }
      });
    }

    const order = await Order.create({
      storeId: req.user,
      customerId,
      items,
      totalAmount,
      paymentType
    });

    if (paymentType === "udhaar") {
      await Udhaar.create({
        storeId: req.user,
        customerId,
        amount: totalAmount,
        description: "Order Credit",
        type: "credit"
      });

      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalDue: totalAmount }
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user })
      .populate("customerId", "name")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
};