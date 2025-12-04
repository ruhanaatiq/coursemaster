// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config(); // load env

// Route imports
let authRoutes = require("./routes/authRoutes");
let courseRoutes = require("./routes/courseRoutes");
let enrollmentRoutes = require("./routes/enrollmentRoutes");
let adminRoutes = require("./routes/adminRoutes");

const app = express();

// 🔎 Normalizer (kept)
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

// DB
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // already connected

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

/**
 * 👉 Local dev: connect + listen
 * 👉 Vercel: only export app; Vercel will call it as a serverless function
 */
if (!process.env.VERCEL) {
  // running locally
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to start server:", err.message);
    });
} else {
  // running on Vercel – connect on cold start
  connectDB().catch((err) => {
    console.error("❌ DB connection error on Vercel:", err.message);
  });
}

// important for Vercel
module.exports = app;
