const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Udhaar = require("../models/Udhaar");
const Admin = require("../models/Admin");
const sendMail = require("../utils/mailer");

exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, paymentType } = req.body;

    let totalAmount = 0;

    // Check stock first
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ msg: "Product not found" });

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
      paymentType,
      status: paymentType === "cash" ? "delivered" : "pending"
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

    // Send email notification to store admin
    try {
      const store = await Admin.findById(req.user);
      const customer = await Customer.findById(customerId);

      // Build items list
      let itemsHtml = "";
      for (const item of items) {
        const product = await Product.findById(item.productId);
        itemsHtml += `<li>${product?.name || "Product"} x${item.quantity} — ₹${item.price * item.quantity}</li>`;
      }

      await sendMail(
        store.email,
        `🛒 New Order from ${customer?.name || "Customer"}`,
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🛒 New Order Received!</h2>
          <p><strong>Customer:</strong> ${customer?.name || "N/A"}</p>
          <p><strong>Phone:</strong> ${customer?.phone || "N/A"}</p>
          <br/>
          <h3>Items:</h3>
          <ul>${itemsHtml}</ul>
          <br/>
          <p><strong>Total:</strong> ₹${totalAmount}</p>
          <p><strong>Payment:</strong> ${paymentType === "cash" ? "💵 Cash" : "📒 Udhaar"}</p>
          <br/>
          <p>Login to your dashboard to update order status! 🙏</p>
        </div>
        `
      );
    } catch (e) {
      console.log("Order notification email failed:", e.message);
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