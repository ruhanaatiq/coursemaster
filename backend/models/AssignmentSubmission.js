const mongoose = require("mongoose");
const { Schema } = mongoose;

const assignmentSubmissionSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    batchId: { type: Schema.Types.ObjectId }, // optional
    moduleId: { type: String, required: true }, // or lessonId/module index
    // From student side:
    answerText: String,
    driveLink: String,

    // For review:
    score: { type: Number, default: null },
    feedback: { type: String, default: "" },
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
