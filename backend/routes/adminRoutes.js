// backend/routes/adminRoutes.js
const express = require("express");
const { adminStats } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only stats
router.get("/stats", protect, adminOnly, adminStats);

module.exports = router;
