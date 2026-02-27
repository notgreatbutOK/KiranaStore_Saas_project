// =======================
// IMPORTS
// =======================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

// =======================
// APP CONFIG
// =======================
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

// =======================
// DATABASE CONNECT
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/kirana_saas")
.then(() => {
  console.log("✅ MongoDB Connected");

  // 🔥 AUTO CREATE SUPER ADMIN
  createSuperAdmin();

})
.catch(err => console.log("DB Error:", err));


// =======================
// AUTO SUPER ADMIN FUNCTION
// =======================
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


// =======================
// ROUTES
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/udhaar", require("./routes/udhaarRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/superadmin", require("./routes/superAdminRoutes"));


// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Kirana SaaS Backend Running");
});


// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});