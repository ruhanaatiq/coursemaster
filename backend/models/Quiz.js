const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }], // 4 options etc.
    correctIndex: { type: Number, required: true }, // 0-based index in options[]
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: String, required: true }, // same id you use in frontend
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

// Only one quiz per course + module
quizSchema.index({ course: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model("Quiz", quizSchema);
