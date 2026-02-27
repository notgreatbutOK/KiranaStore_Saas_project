const Customer = require("../models/Customer");

// ADD CUSTOMER
exports.addCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const customer = await Customer.create({
      storeId: req.admin.id,
      name,
      phone,
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};