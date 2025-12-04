// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");

dotenv.config();

const app = express();

// 🔐 CORS – allow frontend (local + deployed)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => {
  res.send("CourseMaster API is running");
});

// 🔗 DB + server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // ⬇️ Only listen locally, NOT on Vercel
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ⬅️ Important for Vercel: export the app (no app.listen in production)
module.exports = app;
