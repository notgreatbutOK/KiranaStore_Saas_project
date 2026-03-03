require("dotenv").config();
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
console.log("1 auth ok");
app.use("/api/products", require("./routes/productRoutes"));
console.log("2 products ok");
app.use("/api/customers", require("./routes/customerRoutes"));
console.log("3 customers ok");
app.use("/api/udhaar", require("./routes/udhaarRoutes"));
console.log("4 udhaar ok");
app.use("/api/orders", require("./routes/orderRoutes"));
console.log("5 orders ok");
app.use("/api/superadmin", require("./routes/superAdminRoutes"));
console.log("6 superadmin ok");
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
console.log("7 dashboard ok");
app.use("/api/whatsapp", require("./routes/whatsappRoutes"));
console.log("8 whatsapp ok");

app.get("/", (req, res) => {
  res.send("Kirana SaaS Backend Running");
});

startCronJobs();

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});