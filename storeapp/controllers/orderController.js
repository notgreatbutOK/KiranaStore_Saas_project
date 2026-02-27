const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, paymentType } = req.body;

    let totalAmount = 0;

    // Calculate total amount
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({ msg: "Product not found" });
      }

      totalAmount += product.price * item.quantity;
      item.price = product.price;
    }

    // Create order
    const order = await Order.create({
      storeId: req.user,
      customerId,
      items,
      totalAmount,
      paymentType
    });

    // 🔥 Increase due only if udhaar
    if (paymentType === "udhaar") {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalDue: totalAmount }
      });
    }

    res.status(201).json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ storeId: req.user })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};