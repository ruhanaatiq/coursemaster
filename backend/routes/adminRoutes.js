// backend/routes/adminRoutes.js
const express = require("express");
const {
  adminStats,
  // 🔹 NEW: analytics controller
  adminEnrollmentTrend,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// 🔹 Models
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const AssignmentSubmission = require("../models/AssignmentSubmission");

const router = express.Router();

/* ===========================
   0. ADMIN STATS & ANALYTICS
   =========================== */

// Overview stats (cards on dashboard)
router.get("/stats", protect, adminOnly, adminStats);

// 🔹 NEW: enrollments over time (for Recharts chart)
// GET /api/admin/enrollments-over-time?days=30
router.get(
  "/enrollments-over-time",
  protect,
  adminOnly,
  adminEnrollmentTrend
);

/* ===========================
   1. COURSE MANAGEMENT (CRUD)
   =========================== */

// Create course
router.post("/courses", protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body); // validate in real app
    res.status(201).json(course);
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Failed to create course" });
  }
});

// Get all courses
router.get("/courses", protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

// Get single course
router.get("/courses/:courseId", protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("Get course error:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

// Update course
router.put("/courses/:courseId", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Course not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Failed to update course" });
  }
});

// Delete course
router.delete("/courses/:courseId", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.courseId);
    if (!deleted) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

/* ===========================
   1.b BATCHES FOR A COURSE
   =========================== */

// Add batch
router.post(
  "/courses/:courseId/batches",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { name, startDate, endDate } = req.body;

      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      course.batches.push({ name, startDate, endDate });
      await course.save();

      const newBatch = course.batches[course.batches.length - 1];
      res.status(201).json(newBatch);
    } catch (err) {
      console.error("Add batch error:", err);
      res.status(500).json({ message: "Failed to add batch" });
    }
  }
);

// Update batch
router.put(
  "/courses/:courseId/batches/:batchId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { courseId, batchId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const batch = course.batches.id(batchId);
      if (!batch) return res.status(404).json({ message: "Batch not found" });

      batch.name = req.body.name ?? batch.name;
      batch.startDate = req.body.startDate ?? batch.startDate;
      batch.endDate = req.body.endDate ?? batch.endDate;

      await course.save();
      res.json(batch);
    } catch (err) {
      console.error("Update batch error:", err);
      res.status(500).json({ message: "Failed to update batch" });
    }
  }
);

// Delete batch
router.delete(
  "/courses/:courseId/batches/:batchId",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { courseId, batchId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const batch = course.batches.id(batchId);
      if (!batch) return res.status(404).json({ message: "Batch not found" });

      batch.remove();
      await course.save();
      res.json({ message: "Batch removed" });
    } catch (err) {
      console.error("Delete batch error:", err);
      res.status(500).json({ message: "Failed to delete batch" });
    }
  }
);

/* ===========================
   2. ENROLLMENT MANAGEMENT
   =========================== */

// GET /api/admin/enrollments?courseId=...&batchId=...
router.get("/enrollments", protect, adminOnly, async (req, res) => {
  try {
    const { courseId, batchId } = req.query;

    const filter = {};
    if (courseId) filter.course = courseId;
    if (batchId) filter.batchId = batchId;

    const enrollments = await Enrollment.find(filter)
      // NOTE: make sure this matches your Enrollment schema field name.
      // If your schema uses `user`, change "student" to "user" here
      .populate("student", "name email")
      .populate("course", "title");

    res.json(enrollments);
  } catch (err) {
    console.error("Get enrollments error:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

/* ===========================
   3. ASSIGNMENT REVIEW
   =========================== */

// Get submissions (filter by course, batch, status)
router.get("/assignments", protect, adminOnly, async (req, res) => {
  try {
    const { courseId, batchId, status } = req.query;

    const filter = {};
    if (courseId) filter.course = courseId;
    if (batchId) filter.batchId = batchId;
    if (status) filter.status = status; // "submitted" or "reviewed"

    const submissions = await AssignmentSubmission.find(filter)
      .populate("student", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Failed to fetch assignment submissions" });
  }
});

// Review/update a submission
router.patch("/assignments/:id", protect, adminOnly, async (req, res) => {
  try {
    const { score, feedback, status } = req.body;
    const submission = await AssignmentSubmission.findById(req.params.id);

    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    if (score !== undefined) submission.score = score;
    if (feedback !== undefined) submission.feedback = feedback;
    if (status) submission.status = status; // typically "reviewed"

    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error("Update assignment error:", err);
    res.status(500).json({ message: "Failed to update submission" });
  }
});

module.exports = router;
