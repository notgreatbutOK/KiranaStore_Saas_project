module.exports = (req, res, next) => {
  if (req.role !== "superadmin") {
    return res.status(403).json({ msg: "Access denied. Super Admin only." });
  }
  next();
};