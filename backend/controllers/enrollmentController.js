// backend/controllers/enrollmentController.js

const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

exports.enrollInCourse = async (req, res) => {
  try {
    const studentId = req.user._id;    // logged-in student from protect()
    const { courseId, batchId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    // Check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prevent duplicate enrollment
    const existing = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      batch: batchId || undefined,
      status: "enrolled",
      progress: 0,
    });

    return res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (err) {
    console.error("Enrollment Error:", err);
    return res.status(500).json({
      message: "Failed to enroll in course",
    });
  }
};
