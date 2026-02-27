const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  name: String,
  phone: String,
  totalDue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);