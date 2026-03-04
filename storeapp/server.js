require("dotenv").config();
const sendMail = require("./utils/mailer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
const startCronJobs = require("./utils/cronJobs");

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5000;

const sessions = {};

mongoose.connect("mongodb://127.0.0.1:27017/kirana_saas")
.then(() => {
  console.log("✅ MongoDB Connected");
  createSuperAdmin();
})
.catch(err => console.log("DB Error:", err));

async function createSuperAdmin() {
  try {
    const existingSuper = await Admin.findOne({ role: "superadmin" });
    if (!existingSuper) {
      const hash = await bcrypt.hash("123456", 10);
      await Admin.create({
        name: "Platform Owner",
        email: "super@saas.com",
        password: hash,
        role: "superadmin",
        status: "active"
      });
      console.log("👑 Super Admin Created Automatically");
    }
  } catch (err) {
    console.log("Super Admin Creation Error:", err);
  }
}

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/udhaar", require("./routes/udhaarRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/superadmin", require("./routes/superAdminRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/whatsapp", require("./routes/whatsappRoutes"));

app.get("/webhook", (req, res) => {
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

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const from = msg.from;
    const body = msg.text?.body?.trim() || "";
    const bodyLower = body.toLowerCase();

    console.log(`📩 From: ${from} | Message: ${body}`);

    const phoneStripped = from.startsWith("91") ? from.slice(2) : from;

    const displayPhone = value?.metadata?.display_phone_number?.replace(/\D/g, "");
    const store = await Admin.findOne({
      role: "store",
      status: "active",
      mobileNumber: displayPhone
    });
    if (!store) return;
    const storeId = store._id;

    const Product = require("./models/Product");
    const Customer = require("./models/Customer");
    const Order = require("./models/Order");
    const Udhaar = require("./models/Udhaar");
    const { sendMessage } = require("./services/whatsappService");

    let customer = await Customer.findOne({
      storeId,
      phone: { $in: [from, phoneStripped] }
    });

    // New customer
    if (!customer) {
      if (!sessions[from]) {
        sessions[from] = { step: "get_name" };
        await sendMessage(from, `👋 Welcome to ${store.name}!\n\nWhat's your name?`);
        return;
      }

      if (sessions[from]?.step === "get_name") {
        sessions[from] = { step: "get_email", name: body };
        await sendMessage(from, `Nice to meet you ${body}! 😊\n\nWhat's your email address?\n(Type *skip* to skip)`);
        return;
      }

      if (sessions[from]?.step === "get_email") {
        const customerName = sessions[from].name;
        const customerEmail = bodyLower === "skip" ? null : body;

        customer = await Customer.create({
          storeId,
          name: customerName,
          phone: phoneStripped,
          email: customerEmail,
          totalDue: 0
        });

        // Send welcome email
        if (customerEmail) {
          try {
            await sendMail(
              customerEmail,
              `Welcome to ${store.name}! 🎉`,
              `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome ${customerName}! 👋</h2>
                <p>You have been registered as a customer at <strong>${store.name}</strong>.</p>
                <p>You can now place orders directly on WhatsApp!</p>
                <p>Thank you for choosing us! 🙏</p>
              </div>`
            );
          } catch (e) {
            console.log("Welcome email failed:", e.message);
          }
        }

        sessions[from] = { step: "just_registered", registeredAt: Date.now() };
        await sendMessage(from, `✅ Welcome ${customerName}! Type *hi* to see our products 🙂`);
        return;
      }
    }

    // HI
    if (["hi", "hello", "hey", "start"].includes(bodyLower)) {
      if (sessions[from]?.step === "just_registered" && Date.now() - sessions[from].registeredAt < 3000) {
        sessions[from] = { step: "idle" };
        return;
      }
      const products = await Product.find({ owner: storeId, quantity: { $gt: 0 } });
      let productList = `👋 Hello ${customer.name}!\n\nAvailable products:\n\n`;
      products.forEach((p, i) => {
        productList += `${i + 1}. ${p.name} — ₹${p.price}\n`;
      });
      productList += `\n📦 To order: *order <name> <qty>*\nExample: order Sugar 2\n\nType *checkout* to pay\n💰 Type *balance* for udhaar`;
      sessions[from] = { step: "shopping", cart: [] };
      await sendMessage(from, productList);
      return;
    }

    // BALANCE
    if (bodyLower === "balance") {
      const text = customer.totalDue > 0
        ? `💰 Pending udhaar: *₹${customer.totalDue}*`
        : `✅ No pending udhaar!`;
      await sendMessage(from, text);
      return;
    }

    // ADD TO CART
    if (bodyLower.startsWith("order ")) {
      const parts = body.trim().split(" ");
      const qty = parseInt(parts[parts.length - 1]);
      const productName = parts.slice(1, parts.length - 1).join(" ");

      if (isNaN(qty) || qty <= 0) {
        await sendMessage(from, "❌ Invalid quantity!");
        return;
      }

      const product = await Product.findOne({
        owner: storeId,
        name: { $regex: new RegExp(productName, "i") },
        quantity: { $gt: 0 }
      });

      if (!product) {
        await sendMessage(from, `❌ "${productName}" not found or out of stock!`);
        return;
      }

      if (product.quantity < qty) {
        await sendMessage(from, `❌ Only ${product.quantity} units available!`);
        return;
      }

      if (!sessions[from]) sessions[from] = { step: "shopping", cart: [] };
      if (!sessions[from].cart) sessions[from].cart = [];

      const existingItem = sessions[from].cart.find(i => i.productId.toString() === product._id.toString());
      if (existingItem) {
        existingItem.qty += qty;
        existingItem.total = existingItem.qty * product.price;
      } else {
        sessions[from].cart.push({
          productId: product._id,
          productName: product.name,
          qty,
          price: product.price,
          total: qty * product.price
        });
      }

      sessions[from].step = "shopping";

      const cart = sessions[from].cart;
      let cartText = `🛒 Cart updated!\n\n`;
      let grandTotal = 0;
      cart.forEach(item => {
        cartText += `• ${item.productName} x${item.qty} = ₹${item.total}\n`;
        grandTotal += item.total;
      });
      cartText += `\n💰 Total: ₹${grandTotal}\n\nAdd more or type *checkout* to pay!`;

      await sendMessage(from, cartText);
      return;
    }

    // CHECKOUT
    if (bodyLower === "checkout") {
      if (!sessions[from]?.cart || sessions[from].cart.length === 0) {
        await sendMessage(from, "🛒 Your cart is empty! Type *hi* to see products.");
        return;
      }

      const cart = sessions[from].cart;
      let grandTotal = 0;
      let cartText = `🧾 Order Summary:\n\n`;
      cart.forEach(item => {
        cartText += `• ${item.productName} x${item.qty} = ₹${item.total}\n`;
        grandTotal += item.total;
      });

      cartText += `\n💰 Order Total: ₹${grandTotal}`;

      if (customer.totalDue > 0) {
        cartText += `\n⚠️ Pending Due: ₹${customer.totalDue}`;
        cartText += `\n💸 Total Payable: ₹${grandTotal + customer.totalDue}`;
      }

      cartText += `\n\nPay with *cash* or *udhaar*?`;

      sessions[from].step = "confirm_payment";
      sessions[from].grandTotal = grandTotal;

      await sendMessage(from, cartText);
      return;
    }

    // PAYMENT CONFIRMATION
    if (sessions[from]?.step === "confirm_payment") {
      if (!["cash", "udhaar"].includes(bodyLower)) {
        await sendMessage(from, "Please reply with *cash* or *udhaar*");
        return;
      }

      const cart = sessions[from].cart;
      const grandTotal = sessions[from].grandTotal;

      // Refresh customer to get latest due
      customer = await Customer.findById(customer._id);

      // Create order
      await Order.create({
        storeId,
        customerId: customer._id,
        paymentType: bodyLower,
        items: cart.map(i => ({ productId: i.productId, quantity: i.qty, price: i.price })),
        totalAmount: grandTotal,
        status: bodyLower === "cash" ? "delivered" : "pending"
      });

      // Notify store admin
      try {
        let itemsHtml = cart.map(i => `<li>${i.productName} x${i.qty} — ₹${i.total}</li>`).join("");
        await sendMail(
          store.email,
          `🛒 New WhatsApp Order from ${customer.name}`,
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>🛒 New WhatsApp Order!</h2>
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
            <h3>Items:</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Total:</strong> ₹${grandTotal}</p>
            <p><strong>Payment:</strong> ${bodyLower === "cash" ? "💵 Cash" : "📒 Udhaar"}</p>
            <p>Login to dashboard to update order status! 🙏</p>
          </div>`
        );
      } catch (e) {
        console.log("WhatsApp order notification failed:", e.message);
      }

      for (const item of cart) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: -item.qty } });
      }

      if (bodyLower === "udhaar") {
        await Customer.findByIdAndUpdate(customer._id, { $inc: { totalDue: grandTotal } });
        await Udhaar.create({
          storeId,
          customerId: customer._id,
          amount: grandTotal,
          description: `WhatsApp order - ${cart.map(i => i.productName).join(", ")}`,
          type: "credit"
        });
      }

      let receipt = `✅ Order confirmed!\n\n`;
      cart.forEach(item => {
        receipt += `• ${item.productName} x${item.qty} = ₹${item.total}\n`;
      });
      receipt += `\n💰 Total: ₹${grandTotal}\nPayment: ${bodyLower === "cash" ? "💵 Cash" : "📒 Udhaar"}\n\nThank you! 🙏`;

      sessions[from] = { step: "idle", cart: [] };
      if (bodyLower === "udhaar") {
        receipt += `\n\n🚚 Your order is on the way! We'll notify you once delivered.`;
      }
      await sendMessage(from, receipt);
      return;
    }

    // DEFAULT
    await sendMessage(from, `Type *hi* to see products or *balance* for udhaar 🙂`);

  } catch (err) {
    console.error("Webhook error:", err.message);
  }
});

app.get("/", (req, res) => {
  res.send("Kirana SaaS Backend Running");
});

startCronJobs();

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});