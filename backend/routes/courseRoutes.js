// backend/routes/courseRoutes.js
const express = require("express");
const Course = require("../models/Course");
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
 */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      syllabus, // textarea string from frontend
      price,
      category,
      tags,
      thumbnail,
      level,
    } = req.body;

    console.log("📥 Incoming course payload:", req.body);

    if (!title || !description || !instructor) {
      return res
        .status(400)
        .json({ message: "Title, description, and instructor are required" });
    }

    // convert syllabus text -> array
    let syllabusArray = [];
    if (typeof syllabus === "string" && syllabus.trim() !== "") {
      syllabusArray = syllabus
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => ({
          title: line,
          description: "",
          order: index + 1,
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

module.exports = router;
