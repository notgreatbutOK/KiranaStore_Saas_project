const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createOrder, getMyOrders } = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/", auth, getMyOrders);

module.exports = router;