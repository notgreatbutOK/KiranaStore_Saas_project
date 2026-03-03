const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: String,

  mobileNumber: {
    type: String,
    required: true,
    unique: true
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

  phoneNumberId: {
    type: String,
    default: null
  },

  wabaId: {
    type: String,
    default: null
  },

  whatsappAccessToken: {
    type: String,
    default: null
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