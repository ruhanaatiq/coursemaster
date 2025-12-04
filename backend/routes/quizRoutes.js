const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Quiz = require("../models/Quiz");

// GET /api/quizzes?courseId=...&moduleId=...
router.get("/", protect, async (req, res) => {
  try {
    const { courseId, moduleId } = req.query;

    if (!courseId || !moduleId) {
      return res
        .status(400)
        .json({ message: "courseId and moduleId are required" });
    }

    const quiz = await Quiz.findOne({ course: courseId, moduleId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found for this module" });
    }

    // You *could* hide correctIndex here if you wanted to score on backend-only.
    res.json(quiz);
  } catch (err) {
    console.error("Fetch quiz error:", err);
    res.status(500).json({ message: "Failed to load quiz" });
  }
});

// POST /api/quizzes/submit
// body: { courseId, moduleId, answers: [selectedIndex, ...] }
router.post("/submit", protect, async (req, res) => {
  try {
    const { courseId, moduleId, answers } = req.body;

    if (!courseId || !moduleId || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ message: "courseId, moduleId and answers[] are required" });
    }

    const quiz = await Quiz.findOne({ course: courseId, moduleId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });

    const total = quiz.questions.length || 0;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // You could log quiz attempts here if needed

    res.json({
      correct,
      total,
      score,
    });
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ message: "Failed to submit quiz" });
  }
});

module.exports = router;
