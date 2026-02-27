const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["store", "superadmin"],
    default: "store"
  },
  status: {
    type: String,
    enum: ["pending", "active", "suspended"],
    default: "pending"   // 🔥 important
  }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);