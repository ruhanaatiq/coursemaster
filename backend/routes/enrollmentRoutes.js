// backend/routes/enrollmentRoutes.js
const express = require("express");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/enrollments
 * Body: { courseId }
 * Creates (or returns) an enrollment for the logged in user.
 * For now we'll mark payment as "paid" immediately. Later you can switch to "pending" + Stripe.
 */
router.post("/", protect, async (req, res) => {
  try {
    const studentId = req.user._id;      // ✅ logged-in student
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If already enrolled, just return it
    let enrollment = await Enrollment.findOne({
      student: studentId,               // ✅ use student field
      course: courseId,
    }).populate("course");

    if (enrollment) {
      return res.json({
        message: "Already enrolled in this course",
        enrollment,
      });
    }

    // For now: assume instant payment success
    enrollment = await Enrollment.create({
      student: studentId,               // ✅ use student field
      course: courseId,
      status: "enrolled",
      progress: 0,
      // ⬇ keep these only if your schema has them
      paymentStatus: course.price > 0 ? "paid" : "paid",
      totalPrice: course.price || 0,
    });

    const populated = await enrollment.populate("course");

    return res.status(201).json({
      message: "Enrollment created",
      enrollment: populated,
    });
  } catch (err) {
    console.error("❌ Enroll error:", err);
    return res.status(500).json({
      message: err.message || "Failed to enroll",
    });
  }
});

/**
 * GET /api/enrollments/by-course/:courseId
 * Used by the lesson page to load "my enrollment + course" for a specific course.
 */
router.get("/by-course/:courseId", protect, async (req, res) => {
  try {
    const studentId = req.user._id;     // ✅
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // Optional safety: ensure course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,               // ✅
      course: courseId,
    }).populate("course");

    if (!enrollment) {
      return res.status(404).json({
        message: "You are not enrolled in this course yet",
      });
    }

    return res.json({ enrollment });
  } catch (err) {
    console.error("❌ Get enrollment by course error:", err);
    return res.status(500).json({
      message: err.message || "Failed to load enrollment",
    });
  }
});

/**
 * GET /api/enrollments/me
 * Get all enrollments for logged in user (student dashboard).
 */
router.get("/me", protect, async (req, res) => {
  try {
    const studentId = req.user._id;     // ✅

    const enrollments = await Enrollment.find({ student: studentId }) // ✅
      .populate("course")
      .sort({ createdAt: -1 });

    return res.json({ enrollments });
  } catch (err) {
    console.error("❌ Get my enrollments error:", err);
    return res.status(500).json({
      message: err.message || "Failed to load enrollments",
    });
  }
});

/**
 * PATCH /api/enrollments/:id/progress
 * Body: { progress }
 * Updates progress & auto-mark as completed if >= 100 (or 90).
 */
router.patch("/:id/progress", protect, async (req, res) => {
  try {
    const studentId = req.user._id;     // ✅
    const { id } = req.params;
    let { progress } = req.body;

    progress = Number(progress);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      return res
        .status(400)
        .json({ message: "Progress must be between 0 and 100" });
    }

    const enrollment = await Enrollment.findOne({
      _id: id,
      student: studentId,               // ✅
    }).populate("course");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.progress = progress;

    if (progress >= 100) {
      enrollment.status = "completed";
    }

    await enrollment.save();

    res.json({
      message: "Progress updated",
      enrollment,
    });
  } catch (err) {
    console.error("❌ Update progress error:", err);
    return res.status(500).json({
      message: err.message || "Failed to update progress",
    });
  }
});

/**
 * PATCH /api/enrollments/:id/pay
 * (Optional) Manual endpoint to mark as paid – for now this simulates a payment success.
 */
router.patch("/:id/pay", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id).populate("course");
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // ⬇ only if paymentStatus exists in your schema
    enrollment.paymentStatus = "paid";
    await enrollment.save();

    res.json({ message: "Payment marked as paid", enrollment });
  } catch (err) {
    console.error("❌ Mark paid error:", err);
    res.status(500).json({ message: err.message || "Failed to mark paid" });
  }
});

module.exports = router;
