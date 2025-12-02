// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config(); // ✅ load env BEFORE requiring anything that might use it

// Route imports
let authRoutes = require("./routes/authRoutes");
let courseRoutes = require("./routes/courseRoutes");
let enrollmentRoutes = require("./routes/enrollmentRoutes");
let adminRoutes = require("./routes/adminRoutes");

const app = express();

// 🔎 Normalizer: if a route module exported { router } instead of the router itself
const normalizeRoute = (mod) => {
  if (!mod) return mod;
  if (typeof mod === "function") return mod;
  if (mod.router && typeof mod.router === "function") return mod.router;
  return mod;
};

authRoutes = normalizeRoute(authRoutes);
courseRoutes = normalizeRoute(courseRoutes);
enrollmentRoutes = normalizeRoute(enrollmentRoutes);
adminRoutes = normalizeRoute(adminRoutes);

// Debug (optional – remove later if you want)
console.log("typeof authRoutes:", typeof authRoutes);
console.log("typeof courseRoutes:", typeof courseRoutes);
console.log("typeof enrollmentRoutes:", typeof enrollmentRoutes);
console.log("typeof adminRoutes:", typeof adminRoutes);

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("CourseMaster API is running");
});

// DB + server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  })
