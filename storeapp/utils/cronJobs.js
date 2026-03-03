const cron = require("node-cron");
const Admin = require("../models/Admin");
const sendMail = require("./mailer");

const startCronJobs = () => {
  // Runs every day at 9am
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

        // Send email if 3 days left
        if (daysLeft === 6) {
          await sendMail(
            store.email,
            "⏰ Your Kirana SaaS Trial Expires in 6 Days!",
            `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi ${store.name}!</h2>
              <p>Your <strong>14-day free trial</strong> expires in <strong>6 days</strong>.</p>
              <p>To continue using Kirana SaaS without interruption, please contact your platform admin to activate a subscription.</p>
              <br/>
              <p>📧 Contact: <strong>super@saas.com</strong></p>
              <p>💰 Plans available: 1 Month, 3 Months, 6 Months, 1 Year</p>
              <br/>
              <p>Thank you for using Kirana SaaS! 🙏</p>
            </div>
            `
          );
        }

        // Send email if 1 day left
        if (daysLeft === 1) {
          await sendMail(
            store.email,
            "🚨 Your Kirana SaaS Trial Expires Tomorrow!",
            `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi ${store.name}!</h2>
              <p>Your <strong>14-day free trial</strong> expires <strong>tomorrow</strong>!</p>
              <p>Please contact your platform admin immediately to avoid losing access.</p>
              <br/>
              <p>📧 Contact: <strong>super@saas.com</strong></p>
              <br/>
              <p>Thank you for using Kirana SaaS! 🙏</p>
            </div>
            `
          );
        }
      }
    } catch (err) {
      console.log("Cron error:", err.message);
    }
  });

  console.log("Cron jobs started!");
};

module.exports = startCronJobs;