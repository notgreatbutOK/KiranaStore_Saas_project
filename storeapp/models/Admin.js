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
    default: "pending"
  },
  trialEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  },
  subscriptionPlan: {
    type: String,
    enum: ["trial", "1month", "3months", "6months", "1year", "none"],
    default: "trial"
  },
  
  subscriptionEndDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);