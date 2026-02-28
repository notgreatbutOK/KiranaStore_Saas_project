const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

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

  trialStartDate: {
    type: Date
  },

  trialEndDate: {
    type: Date
  },

  subscriptionStatus: {
    type: String,
    enum: ["trial", "active", "expired"],
    default: "trial"
  }

}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);