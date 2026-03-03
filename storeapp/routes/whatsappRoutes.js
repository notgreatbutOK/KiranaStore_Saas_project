const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Udhaar = require("../models/Udhaar");
const Admin = require("../models/Admin");
const { sendMessage } = require("../services/whatsappService");

const sessions = {};

// VERIFY WEBHOOK
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// RECEIVE MESSAGE
router.post("/", async (req, res) => {
  // ... rest of the code
});

// RECEIVE MESSAGE
router.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return res.sendStatus(200);

    const msg = messages[0];
    const from = msg.from;
    const body = msg.text?.body?.trim() || "";
    const bodyLower = body.toLowerCase();

    console.log(`📩 From: ${from} | Message: ${body}`);

    // Strip country code for DB lookup
    const phoneStripped = from.startsWith("91") ? from.slice(2) : from;

    // Find which store this bot belongs to
    const store = await Admin.findOne({ role: "store", status: "active" });
    if (!store) return res.sendStatus(200);
    const storeId = store._id;

    // Find or handle new customer
    let customer = await Customer.findOne({
      storeId,
      phone: { $in: [from, phoneStripped] }
    });

    // New customer flow
    if (!customer) {
      if (!sessions[from]) {
        sessions[from] = { step: "get_name" };
        await sendMessage(from, `👋 Welcome to ${store.name}!\n\nWhat's your name?`);
        return res.sendStatus(200);
      }

      if (sessions[from]?.step === "get_name") {
        customer = await Customer.create({
          storeId,
          name: body,
          phone: phoneStripped,
          totalDue: 0
        });
        sessions[from] = { step: "idle" };
        await sendMessage(from, `✅ Welcome ${body}! You're now registered.\n\nType *hi* to see our products! 🙂`);
        return res.sendStatus(200);
      }
    }

    // HI
    if (["hi", "hello", "hey", "start"].includes(bodyLower)) {
      const products = await Product.find({ owner: storeId, quantity: { $gt: 0 } });
      let productList = `👋 Hello ${customer.name}!\n\nAvailable products:\n\n`;
      products.forEach((p, i) => {
        productList += `${i + 1}. ${p.name} — ₹${p.price}\n`;
      });
      productList += `\n📦 To order: *order <name> <qty>*\nExample: order Sugar 2\n\n💰 Type *balance* for udhaar`;
      sessions[from] = { step: "idle" };
      await sendMessage(from, productList);
      return res.sendStatus(200);
    }

    // BALANCE
    if (bodyLower === "balance") {
      const msg = customer.totalDue > 0
        ? `💰 Pending udhaar: *₹${customer.totalDue}*`
        : `✅ No pending udhaar!`;
      await sendMessage(from, msg);
      return res.sendStatus(200);
    }

    // ORDER
    if (bodyLower.startsWith("order ")) {
      const parts = body.trim().split(" ");
      const qty = parseInt(parts[parts.length - 1]);
      const productName = parts.slice(1, parts.length - 1).join(" ");

      if (isNaN(qty) || qty <= 0) {
        await sendMessage(from, "❌ Invalid quantity!");
        return res.sendStatus(200);
      }

      const product = await Product.findOne({
        owner: storeId,
        name: { $regex: new RegExp(productName, "i") },
        quantity: { $gt: 0 }
      });

      if (!product) {
        await sendMessage(from, `❌ "${productName}" not found or out of stock!`);
        return res.sendStatus(200);
      }

      if (product.quantity < qty) {
        await sendMessage(from, `❌ Only ${product.quantity} units available!`);
        return res.sendStatus(200);
      }

      const total = product.price * qty;
      sessions[from] = {
        step: "confirm_payment",
        productId: product._id,
        productName: product.name,
        qty,
        total,
        customerId: customer._id,
        storeId
      };

      await sendMessage(from,
        `🛒 Order Summary:\n\n` +
        `Product: ${product.name}\n` +
        `Quantity: ${qty}\n` +
        `Total: ₹${total}\n\n` +
        `Pay with *cash* or *udhaar*?`
      );
      return res.sendStatus(200);
    }

    // PAYMENT CONFIRMATION
    if (sessions[from]?.step === "confirm_payment") {
      if (!["cash", "udhaar"].includes(bodyLower)) {
        await sendMessage(from, "Please reply with *cash* or *udhaar*");
        return res.sendStatus(200);
      }

      const { productId, productName, qty, total, customerId } = sessions[from];

      await Order.create({
        storeId,
        customerId,
        paymentType: bodyLower,
        items: [{ productId, quantity: qty, price: total / qty }],
        totalAmount: total
      });

      await Product.findByIdAndUpdate(productId, { $inc: { quantity: -qty } });

      if (bodyLower === "udhaar") {
        await Customer.findByIdAndUpdate(customerId, { $inc: { totalDue: total } });
        await Udhaar.create({
          storeId,
          customerId,
          amount: total,
          description: `WhatsApp order - ${productName}`,
          type: "credit"
        });
      }

      sessions[from] = { step: "idle" };

      await sendMessage(from,
        `✅ Order confirmed!\n\n` +
        `${productName} x${qty}\n` +
        `Total: ₹${total}\n` +
        `Payment: ${bodyLower === "cash" ? "💵 Cash" : "📒 Udhaar"}\n\n` +
        `Thank you! 🙏`
      );
      return res.sendStatus(200);
    }

    // DEFAULT
    await sendMessage(from, `Type *hi* to see products or *balance* for udhaar 🙂`);
    res.sendStatus(200);

  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(200);
  }
});

module.exports = router;