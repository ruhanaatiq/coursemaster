// backend/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

// Route imports
let authRoutes = require("./routes/authRoutes");
let courseRoutes = require("./routes/courseRoutes");
let enrollmentRoutes = require("./routes/enrollmentRoutes");

dotenv.config();

const app = express();

// 🔎 Safety: if a route module exported { router } instead of router,
// normalize it here so Express always gets a function.
if (authRoutes && typeof authRoutes !== "function" && authRoutes.router) {
  authRoutes = authRoutes.router;
}
if (courseRoutes && typeof courseRoutes !== "function" && courseRoutes.router) {
  courseRoutes = courseRoutes.router;
}
if (
  enrollmentRoutes &&
  typeof enrollmentRoutes !== "function" &&
  enrollmentRoutes.router
) {
  enrollmentRoutes = enrollmentRoutes.router;
}

// Debug (optional – remove later if you want)
console.log("typeof authRoutes:", typeof authRoutes);
console.log("typeof courseRoutes:", typeof courseRoutes);
console.log("typeof enrollmentRoutes:", typeof enrollmentRoutes);

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
  });
