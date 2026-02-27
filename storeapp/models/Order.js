const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  paymentType: {
    type: String,
    enum: ["cash", "udhaar"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);