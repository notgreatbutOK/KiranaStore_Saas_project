const cron = require("node-cron");
const Admin = require("../models/Admin");
const sendMail = require("./mailer");

const startCronJobs = () => {

  // Trial expiry check - runs every day at 9am
  cron.schedule("0 9 * * *", async () => {
    console.log("Running trial expiry check...");
    try {
      const stores = await Admin.find({
        role: "store",
        subscriptionPlan: "trial",
        status: "active"
      });
      const now = new Date();
      for (const store of stores) {
        const diff = new Date(store.trialEndDate) - now;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (daysLeft === 6) {
          await sendMail(
            store.email,
            "⏰ Your Kirana SaaS Trial Expires in 6 Days!",
            `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi ${store.name}!</h2>
              <p>Your <strong>14-day free trial</strong> expires in <strong>6 days</strong>.</p>
              <p>Contact your platform admin to activate a subscription.</p>
              <p>📧 Contact: <strong>super@saas.com</strong></p>
              <p>💰 Plans available: 1 Month, 3 Months, 6 Months, 1 Year</p>
              <p>Thank you for using Kirana SaaS! 🙏</p>
            </div>`
          );
        }
        if (daysLeft === 1) {
          await sendMail(
            store.email,
            "🚨 Your Kirana SaaS Trial Expires Tomorrow!",
            `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi ${store.name}!</h2>
              <p>Your <strong>14-day free trial</strong> expires <strong>tomorrow</strong>!</p>
              <p>Please contact your platform admin immediately.</p>
              <p>📧 Contact: <strong>super@saas.com</strong></p>
              <p>Thank you for using Kirana SaaS! 🙏</p>
            </div>`
          );
        }
      }
    } catch (err) {
      console.log("Trial expiry cron error:", err.message);
    }
  });

  // Low stock check - runs 3 times a day
  cron.schedule("0 8,13,18 * * *", async () => {
    console.log("Running low stock check...");
    try {
      const Product = require("../models/Product");
      const stores = await Admin.find({ role: "store", status: "active" });
      for (const store of stores) {
        const lowStockProducts = await Product.find({
          owner: store._id,
          quantity: { $gt: 0, $lt: 5 }
        });
        const outOfStockProducts = await Product.find({
          owner: store._id,
          quantity: 0
        });
        if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) continue;

        let html = `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>📦 Stock Alert for ${store.name}</h2>`;
        if (outOfStockProducts.length > 0) {
          html += `<h3 style="color: red;">❌ Out of Stock</h3><ul>`;
          outOfStockProducts.forEach(p => {
            html += `<li>${p.name} — 0 ${p.unit || "pieces"}</li>`;
          });
          html += `</ul>`;
        }
        if (lowStockProducts.length > 0) {
          html += `<h3 style="color: orange;">⚠️ Low Stock</h3><ul>`;
          lowStockProducts.forEach(p => {
            html += `<li>${p.name} — ${p.quantity} ${p.unit || "pieces"} remaining</li>`;
          });
          html += `</ul>`;
        }
        html += `<p>Please restock soon! 🙏</p></div>`;
        await sendMail(store.email, `⚠️ Stock Alert — ${store.name}`, html);
        console.log(`Stock alert sent to ${store.email}`);
      }
    } catch (err) {
      console.log("Low stock cron error:", err.message);
    }
  });

  // Daily summary - runs every day at 8pm
  cron.schedule("0 20 * * *", async () => {
    console.log("Running daily summary...");
    try {
      const Product = require("../models/Product");
      const Customer = require("../models/Customer");
      const Order = require("../models/Order");
      const stores = await Admin.find({ role: "store", status: "active" });

      for (const store of stores) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = await Order.find({
          storeId: store._id,
          createdAt: { $gte: today }
        });

        const totalRevenue = todayOrders
          .filter(o => o.paymentType === "cash")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const totalUdhaar = todayOrders
          .filter(o => o.paymentType === "udhaar")
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const totalProducts = await Product.countDocuments({ owner: store._id });
        const totalCustomers = await Customer.countDocuments({ storeId: store._id });
        const lowStock = await Product.countDocuments({ owner: store._id, quantity: { $gt: 0, $lt: 5 } });
        const outOfStock = await Product.countDocuments({ owner: store._id, quantity: 0 });

        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>📊 Daily Summary — ${store.name}</h2>
            <p style="color: gray;">${new Date().toLocaleDateString("en-IN")}</p>
            <hr/>
            <h3>💰 Today's Sales</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f0f0f0;">
                <td style="padding: 8px;">Total Orders</td>
                <td style="padding: 8px;"><strong>${todayOrders.length}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px;">Cash Revenue</td>
                <td style="padding: 8px;"><strong>₹${totalRevenue}</strong></td>
              </tr>
              <tr style="background: #f0f0f0;">
                <td style="padding: 8px;">Udhaar Given</td>
                <td style="padding: 8px;"><strong>₹${totalUdhaar}</strong></td>
              </tr>
            </table>
            <h3>📦 Inventory</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f0f0f0;">
                <td style="padding: 8px;">Total Products</td>
                <td style="padding: 8px;"><strong>${totalProducts}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px;">Low Stock</td>
                <td style="padding: 8px; color: orange;"><strong>${lowStock}</strong></td>
              </tr>
              <tr style="background: #f0f0f0;">
                <td style="padding: 8px;">Out of Stock</td>
                <td style="padding: 8px; color: red;"><strong>${outOfStock}</strong></td>
              </tr>
            </table>
            <h3>👥 Customers</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f0f0f0;">
                <td style="padding: 8px;">Total Customers</td>
                <td style="padding: 8px;"><strong>${totalCustomers}</strong></td>
              </tr>
            </table>
            <br/>
            <p style="color: gray;">Automated daily summary from Kirana SaaS 🙏</p>
          </div>
        `;

        await sendMail(store.email, `📊 Daily Summary — ${store.name} — ${new Date().toLocaleDateString("en-IN")}`, html);
        console.log(`Daily summary sent to ${store.email}`);
      }
    } catch (err) {
      console.log("Daily summary cron error:", err.message);
    }
  });

  // Due reminder - runs every day at 10am
  cron.schedule("0 9,13,18 * * *", async () => {
    console.log("Running due reminders...");
    try {
      const Customer = require("../models/Customer");
      const { sendMessage } = require("../services/whatsappService");
      const stores = await Admin.find({ role: "store", status: "active" });

      for (const store of stores) {
        const customersWithDue = await Customer.find({
          storeId: store._id,
          totalDue: { $gt: 0 }
        });

        for (const customer of customersWithDue) {
          if (customer.phone) {
            try {
              await sendMessage(
                `91${customer.phone}`,
                `👋 Hello ${customer.name}!\n\nFriendly reminder from *${store.name}*.\n\n💰 Pending due: *₹${customer.totalDue}*\n\nPlease clear it at your earliest! 🙏`
              );
            } catch (e) {
              console.log("WhatsApp due reminder failed:", e.message);
            }
          }
          if (customer.email) {
            try {
              await sendMail(
                customer.email,
                `💰 Payment Reminder — ${store.name}`,
                `<div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2>Hello ${customer.name}! 👋</h2>
                  <p>Friendly reminder from <strong>${store.name}</strong>.</p>
                  <p>Pending due: <strong style="color: red;">₹${customer.totalDue}</strong></p>
                  <p>Please clear it at your earliest convenience!</p>
                  <p>Thank you! 🙏</p>
                </div>`
              );
            } catch (e) {
              console.log("Email due reminder failed:", e.message);
            }
          }
        }
        if (customersWithDue.length > 0) {
          console.log(`Due reminders sent for ${store.name} — ${customersWithDue.length} customers`);
        }
      }
    } catch (err) {
      console.log("Due reminder cron error:", err.message);
    }
  });

  // Weekly super admin report - runs every Monday at 9am
  cron.schedule("0 9 * * 1", async () => {
    console.log("Running super admin weekly report...");
    try {
      const Order = require("../models/Order");

      const superAdmin = await Admin.findOne({ role: "superadmin" });
      if (!superAdmin) return;

      const now = new Date();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const allStores = await Admin.find({ role: "store" });
      const activeStores = allStores.filter(s => s.status === "active");
      const suspendedStores = allStores.filter(s => s.status === "suspended");
      const newStores = allStores.filter(s => new Date(s.createdAt) >= weekAgo);

      const trialExpiringSoon = allStores.filter(s => {
        if (s.subscriptionPlan !== "trial") return false;
        const diff = new Date(s.trialEndDate) - now;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft > 0;
      });

      const subscribedStores = allStores.filter(s =>
        ["1month", "3months", "6months", "1year"].includes(s.subscriptionPlan)
      );

      // Platform revenue
      const cashResult = await Order.aggregate([
        { $match: { paymentType: "cash" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      const totalRevenue = cashResult[0]?.total || 0;

      // This week's revenue
      const weekResult = await Order.aggregate([
        { $match: { paymentType: "cash", createdAt: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]);
      const weekRevenue = weekResult[0]?.total || 0;

      let trialExpiringHtml = "";
      if (trialExpiringSoon.length > 0) {
        trialExpiringHtml = `<ul>`;
        trialExpiringSoon.forEach(s => {
          const diff = new Date(s.trialEndDate) - now;
          const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
          trialExpiringHtml += `<li>${s.name} (${s.email}) — ${daysLeft} days left</li>`;
        });
        trialExpiringHtml += `</ul>`;
      } else {
        trialExpiringHtml = `<p>No stores expiring soon ✅</p>`;
      }

      let newStoresHtml = "";
      if (newStores.length > 0) {
        newStoresHtml = `<ul>`;
        newStores.forEach(s => {
          newStoresHtml += `<li>${s.name} (${s.email})</li>`;
        });
        newStoresHtml += `</ul>`;
      } else {
        newStoresHtml = `<p>No new stores this week</p>`;
      }

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>👑 Weekly Platform Report</h2>
          <p style="color: gray;">${now.toLocaleDateString("en-IN")}</p>
          <hr/>

          <h3>🏪 Store Overview</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f0f0f0;">
              <td style="padding: 8px;">Total Stores</td>
              <td style="padding: 8px;"><strong>${allStores.length}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;">Active Stores</td>
              <td style="padding: 8px;"><strong>${activeStores.length}</strong></td>
            </tr>
            <tr style="background: #f0f0f0;">
              <td style="padding: 8px;">Subscribed Stores</td>
              <td style="padding: 8px;"><strong>${subscribedStores.length}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;">On Trial</td>
              <td style="padding: 8px;"><strong>${allStores.filter(s => s.subscriptionPlan === "trial").length}</strong></td>
            </tr>
            <tr style="background: #f0f0f0;">
              <td style="padding: 8px;">Suspended Stores</td>
              <td style="padding: 8px; color: red;"><strong>${suspendedStores.length}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;">New Stores This Week</td>
              <td style="padding: 8px; color: green;"><strong>${newStores.length}</strong></td>
            </tr>
          </table>

          <h3>💰 Revenue</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f0f0f0;">
              <td style="padding: 8px;">Total Platform Revenue</td>
              <td style="padding: 8px;"><strong>₹${totalRevenue}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px;">This Week's Revenue</td>
              <td style="padding: 8px;"><strong>₹${weekRevenue}</strong></td>
            </tr>
          </table>

          <h3>⚠️ Trials Expiring in 3 Days</h3>
          ${trialExpiringHtml}

          <h3>🆕 New Stores This Week</h3>
          ${newStoresHtml}

          <br/>
          <p style="color: gray;">Automated weekly report from Kirana SaaS 🙏</p>
        </div>
      `;

      await sendMail(superAdmin.email, `👑 Weekly Platform Report — ${now.toLocaleDateString("en-IN")}`, html);
      console.log("Weekly super admin report sent!");
    } catch (err) {
      console.log("Super admin report cron error:", err.message);
    }
  });

  console.log("Cron jobs started!");
};

module.exports = startCronJobs;