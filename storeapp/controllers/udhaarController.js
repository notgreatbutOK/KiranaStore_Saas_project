const Udhaar = require("../models/Udhaar");
const Customer = require("../models/Customer");

// ADD CREDIT
exports.addCredit = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    await Udhaar.create({
      storeId: req.admin.id,
      customerId,
      amount,
      description,
      type: "credit",
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalDue: amount },
    });

    res.json({ message: "Credit added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD PAYMENT
exports.addPayment = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    await Udhaar.create({
      storeId: req.admin.id,
      customerId,
      amount,
      description,
      type: "payment",
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalDue: -amount },
    });

    res.json({ message: "Payment recorded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CUSTOMER LEDGER
exports.getLedger = async (req, res) => {
  try {
    const { customerId } = req.params;

    const records = await Udhaar.find({
      customerId,
      storeId: req.admin.id,
    }).sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};