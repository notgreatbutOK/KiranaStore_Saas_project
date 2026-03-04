const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    enum: ["pieces", "kg", "grams", "liters", "ml"],
    default: "pieces"
  },

  image: {
  type: String,
  default: null
},
  category: {
    type: String,
    default: "General"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);