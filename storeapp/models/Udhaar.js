const mongoose = require("mongoose");

const udhaarSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  amount: Number,
  description: String,
  type: {
    type: String,
    enum: ["credit", "payment"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Udhaar", udhaarSchema);