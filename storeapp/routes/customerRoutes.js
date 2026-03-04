const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Customer = require("../models/Customer");
const sendMail = require("../utils/mailer");
const Admin = require("../models/Admin");
const { sendMessage } = require("../services/whatsappService");

// Add Customer
router.post("/", auth, async (req, res) => {
  try {
    const customer = await Customer.create({
      storeId: req.user,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email || null
    });

    // Get store details
    const store = await Admin.findById(req.user);

    // Send welcome WhatsApp message
    if (req.body.phone) {
      try {
        await sendMessage(
          `91${req.body.phone}`,
          `👋 Hello ${req.body.name}!\n\nWelcome to *${store.name}*! 🎉\n\nYou have been registered as a customer.\n\nType *hi* to see our products and place orders anytime! 🛒`
        );
      } catch (e) {
        console.log("WhatsApp welcome failed:", e.message);
      }
    }

    // Send welcome email
    if (req.body.email) {
      try {
        await sendMail(
          req.body.email,
          `Welcome to ${store.name}! 🎉`,
          `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome ${req.body.name}! 👋</h2>
            <p>You have been registered as a customer at <strong>${store.name}</strong>.</p>
            <p>You can now place orders directly on WhatsApp!</p>
            <br/>
            <p>Thank you for choosing us! 🙏</p>
          </div>
          `
        );
      } catch (e) {
        console.log("Welcome email failed:", e.message);
      }
    }

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