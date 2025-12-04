// models/Course.js
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["video", "article", "docs", "other"],
      default: "article",
    },
    label: { type: String },
    url: { type: String, required: true },
  },
  { _id: false }
);
const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        
    startDate: { type: Date, required: true },     
    endDate: { type: Date },                       
  },
  { _id: true } 
);
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String },
  description: { type: String },
  order: { type: Number, default: 0 },
  resources: [resourceSchema], // 👈 NEW
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    tags: [{ type: String }],
    syllabus: [lessonSchema],
    thumbnail: { type: String },
    level: { type: String, default: "Beginner" },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", instructor: "text" });

module.exports = mongoose.model("Course", courseSchema);
