const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String },           // YouTube/Vimeo link
  description: { type: String },
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true }, // e.g. "web-development"
    tags: [{ type: String }],                  // ["react", "javascript"]
    syllabus: [lessonSchema],
    thumbnail: { type: String },
    level: { type: String, default: "Beginner" },
  },
  { timestamps: true }
);

// For search by title/instructor
courseSchema.index({ title: "text", instructor: "text" });

module.exports = mongoose.model("Course", courseSchema);
