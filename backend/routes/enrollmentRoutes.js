const express = require("express");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/enrollments
 * Body: { courseId }
 * User must be logged in (student)
 */
router.post("/", protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // prevent duplicate enrollment
    const existing = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "You are already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      status: "enrolled",
      progress: 0,
    });

    res.status(201).json({
      message: "Enrollment successful",
      enrollment,
    });
  } catch (err) {
    console.error("Enroll error:", err);
    res.status(500).json({ message: "Failed to enroll" });
  }
});

/**
 * GET /api/enrollments/my
 * Get logged-in student's enrollments
 */
router.get("/my", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate("course")
      .sort({ createdAt: -1 });

    res.json({ enrollments });
  } catch (err) {
    console.error("Get my enrollments error:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

module.exports = router;
