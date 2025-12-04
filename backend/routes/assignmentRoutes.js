// backend/routes/assignmentRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const AssignmentSubmission = require("../models/AssignmentSubmission");

// POST /api/assignments
// body: { courseId, batchId?, moduleId, answerText?, driveLink? }
router.post("/", protect, async (req, res) => {
  try {
    const { courseId, batchId, moduleId, answerText, driveLink } = req.body;

    if (!courseId || !moduleId) {
      return res
        .status(400)
        .json({ message: "courseId and moduleId are required" });
    }

    if (!answerText && !driveLink) {
      return res
        .status(400)
        .json({ message: "Provide either an answer text or a drive link." });
    }

    // Optional rule: only one submission per module per student → update if exists
    const existing = await AssignmentSubmission.findOne({
      student: req.user._id,
      course: courseId,
      moduleId,
    });

    if (existing) {
      existing.answerText = answerText ?? existing.answerText;
      existing.driveLink = driveLink ?? existing.driveLink;
      existing.status = "submitted"; // reset if admin re-opened
      await existing.save();
      return res.json(existing);
    }

    const submission = await AssignmentSubmission.create({
      student: req.user._id,
      course: courseId,
      batchId: batchId || undefined,
      moduleId,
      answerText,
      driveLink,
      status: "submitted",
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error("Assignment submit error:", err);
    res.status(500).json({ message: "Failed to submit assignment" });
  }
});

module.exports = router;
