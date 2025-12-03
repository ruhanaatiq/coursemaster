// backend/routes/courseRoutes.js
const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment"); // 👈 to clean up enrollments
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET /api/courses
 * List courses with pagination / search / sort
 */
router.get("/", async (req, res) => {
  try {
    let {
      page = 1,
      limit = 6,
      search = "",
      category,
      tags,
      sort = "newest",
    } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 6;

    const filter = {};

    // search by title OR instructor (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (tags) {
      const tagsArray = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagsArray };
    }

    let sortOption = { createdAt: -1 }; // newest by default
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };

    const totalCount = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.json({
      courses,
      totalPages,
      totalCount,
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

/**
 * GET /api/courses/:id
 * Course details
 */
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // IMPORTANT: wrap in { course } because frontend expects data.course
    res.json({ course });
  } catch (err) {
    console.error("Error fetching course details:", err);

    // Handle invalid ObjectId separately so it doesn't look like a server crash
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid course id" });
    }

    res.status(500).json({ message: "Failed to fetch course details" });
  }
});

/**
 * POST /api/courses
 * Create a new course (admin only)
 *
 * Supports two shapes of `syllabus` coming from the frontend:
 *  1) ARRAY of lessons (new UI)
 *  2) STRING (legacy textarea)
 */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      syllabus, // can be ARRAY (new UI) or STRING (old UI)
      price,
      category,
      tags,
      thumbnail,
      level,
    } = req.body;

    console.log(
      "📥 Incoming course payload (CREATE):",
      JSON.stringify(req.body, null, 2)
    );

    if (!title || !description || !instructor) {
      return res
        .status(400)
        .json({ message: "Title, description, and instructor are required" });
    }

    let syllabusArray = [];

    // ✅ NEW: if frontend sends a structured lessons array, normalise it
    if (Array.isArray(syllabus)) {
      syllabusArray = syllabus.map((lesson, index) => ({
        title: (lesson.title || "").trim() || `Lesson ${index + 1}`,
        description: lesson.description || "",
        order:
          typeof lesson.order === "number" && !Number.isNaN(lesson.order)
            ? lesson.order
            : index + 1,
        videoUrl: lesson.videoUrl || "",
        resources: Array.isArray(lesson.resources)
          ? lesson.resources
              .filter((r) => r && r.url)
              .map((r) => ({
                type: r.type || "article",
                label: r.label || "Resource",
                url: r.url,
              }))
          : [],
      }));
    }
    // ✅ Backwards compatible: string -> simple lessons
    else if (typeof syllabus === "string" && syllabus.trim() !== "") {
      syllabusArray = syllabus
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => ({
          title: line,
          description: "",
          order: index + 1,
          videoUrl: "",
          resources: [],
        }));
    }

    const course = await Course.create({
      title,
      description,
      instructor,
      price: Number(price) || 0,
      category: category || "web-development",
      tags:
        Array.isArray(tags)
          ? tags
          : typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : [],
      syllabus: syllabusArray,
      thumbnail: thumbnail || "",
      level: level || "Beginner",
    });

    console.log("✅ Course created:", course._id);

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("❌ Error creating course:", err);
    return res.status(500).json({
      message: err.message || "Failed to create course",
    });
  }
});

/**
 * PUT /api/courses/:id
 * Update an existing course (admin only)
 * Accepts the same syllabus shapes as POST.
 */
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      syllabus, // optional
      price,
      category,
      tags,
      thumbnail,
      level,
    } = req.body;

    console.log(
      "📥 Incoming course payload (UPDATE):",
      JSON.stringify(req.body, null, 2)
    );

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Only update fields if they were sent
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (instructor !== undefined) course.instructor = instructor;
    if (price !== undefined) course.price = Number(price) || 0;
    if (category !== undefined) course.category = category || "web-development";
    if (thumbnail !== undefined) course.thumbnail = thumbnail || "";
    if (level !== undefined) course.level = level || "Beginner";

    if (tags !== undefined) {
      course.tags =
        Array.isArray(tags)
          ? tags
          : typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : [];
    }

    // Handle syllabus if provided
    if (syllabus !== undefined) {
      let syllabusArray = [];

      if (Array.isArray(syllabus)) {
        syllabusArray = syllabus.map((lesson, index) => ({
          title: (lesson.title || "").trim() || `Lesson ${index + 1}`,
          description: lesson.description || "",
          order:
            typeof lesson.order === "number" && !Number.isNaN(lesson.order)
              ? lesson.order
              : index + 1,
          videoUrl: lesson.videoUrl || "",
          resources: Array.isArray(lesson.resources)
            ? lesson.resources
                .filter((r) => r && r.url)
                .map((r) => ({
                  type: r.type || "article",
                  label: r.label || "Resource",
                  url: r.url,
                }))
            : [],
        }));
      } else if (typeof syllabus === "string" && syllabus.trim() !== "") {
        syllabusArray = syllabus
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, index) => ({
            title: line,
            description: "",
            order: index + 1,
            videoUrl: "",
            resources: [],
          }));
      }

      course.syllabus = syllabusArray;
    }

    await course.save();

    return res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    console.error("❌ Error updating course:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid course id" });
    }

    return res.status(500).json({
      message: err.message || "Failed to update course",
    });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete a course (admin only)
 * Also removes related enrollments so dashboards stay clean.
 */
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Clean up enrollments referencing this course
    await Enrollment.deleteMany({ course: courseId });

    return res.json({
      message: "Course deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting course:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid course id" });
    }

    return res.status(500).json({
      message: err.message || "Failed to delete course",
    });
  }
});

module.exports = router;
