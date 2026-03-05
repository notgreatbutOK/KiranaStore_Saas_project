const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Admin = require("../models/Admin");
const { createPaymentParams } = require("../utils/payu");

// Get payment params for a plan
router.post("/initiate", auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const store = await Admin.findById(req.user);
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const params = createPaymentParams(store, plan);
    res.json(params);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Payment success callback
router.post("/success", async (req, res) => {
  try {
    const { txnid, status, mihpayid } = req.body;

    if (status === "success") {
      // Extract storeId from txnid (TXN_storeId_timestamp)
      const storeId = txnid.split("_")[1];
      const plan = req.body.productinfo.split(" ")[2]; // "Kirana SaaS 1month Subscription"

      const planDurations = {
        "1month": 30,
        "3months": 90,
        "6months": 180,
        "1year": 365
      };

      const days = planDurations[plan] || 30;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      await Admin.findByIdAndUpdate(storeId, {
        subscriptionPlan: plan,
        subscriptionEndDate: endDate,
        status: "active"
      });

      console.log(`✅ Payment success for store ${storeId} — plan ${plan}`);
    }

    // Redirect to frontend
    res.redirect(`http://localhost:5173/payment-success`);
  } catch (err) {
    console.log("Payment success error:", err.message);
    res.redirect(`http://localhost:5173/payment-failure`);
  }
});

// Payment failure callback
router.post("/failure", async (req, res) => {
  res.redirect(`http://localhost:5173/payment-failure`);
});

// Get subscription status
router.get("/subscription", auth, async (req, res) => {
  try {
    const store = await Admin.findById(req.user);
    if (!store) return res.status(404).json({ msg: "Store not found" });

    const now = new Date();
    let daysLeft = 0;

    if (store.subscriptionPlan === "trial") {
      const diff = new Date(store.trialEndDate) - now;
      daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    res.json({
      plan: store.subscriptionPlan,
      daysLeft,
      endDate: store.subscriptionEndDate || store.trialEndDate
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;