// backend/controllers/courseController.js
const Course = require("../models/Course");

// GET /api/courses
// Query: page, limit, search, category, sort
exports.getCourses = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 6,
      search = "",
      category,
      sort = "newest",
    } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 6;

    // ----- FILTER -----
    const filter = {};

    // search by title OR instructor (case-insensitive)
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { instructor: regex }];
    }

    // category
    if (category && category !== "all") {
      filter.category = category;
    }

    // ----- SORT -----
    let sortOption = { createdAt: -1 }; // default newest

    if (sort === "priceLow") {
      sortOption = { price: 1 };
    } else if (sort === "priceHigh") {
      sortOption = { price: -1 };
    }

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
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// POST /api/courses (Admin only)
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      syllabus,
      price,
      category,
      tags,
    } = req.body;

    if (!title || !description || !instructor) {
      return res.status(400).json({
        message: "Title, description, and instructor are required",
      });
    }

    const course = await Course.create({
      title,
      description,
      instructor,
      syllabus,
      price: Number(price) || 0,
      category: category || "general",
      tags:
        typeof tags === "string"
          ? tags.split(",").map((t) => t.trim())
          : tags || [],
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ message: "Failed to create course" });
  }
};
