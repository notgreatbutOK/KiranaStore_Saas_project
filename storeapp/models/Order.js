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

  paid: {
  type: Boolean,
  default: false
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
  },
  status: {
    type: String,
    enum: ["pending", "delivered", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);