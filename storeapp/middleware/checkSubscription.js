const Admin = require("../models/Admin");

module.exports = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Superadmin bypass
    if (admin.role === "superadmin") {
      return next();
    }

    if (admin.status !== "active") {
      return res.status(403).json({ message: "Account not active" });
    }

    // Check trial expiry
    if (
      admin.subscriptionStatus === "trial" &&
      new Date() > admin.trialEndDate
    ) {
      admin.subscriptionStatus = "expired";
      await admin.save();

      return res.status(403).json({
        message: "Trial expired. Please subscribe."
      });
    }

    if (admin.subscriptionStatus === "expired") {
      return res.status(403).json({
        message: "Trial expired. Please subscribe."
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};