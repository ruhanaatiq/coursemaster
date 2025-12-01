const express = require("express");
const Course = require("../models/Course");
const router = express.Router();

/**
 * GET /api/courses
 * Query params:
 *  - page (default: 1)
 *  - limit (default: 6)
 *  - search (by title or instructor)
 *  - category
 *  - tags (comma-separated)
 *  - sort: "newest" | "priceLow" | "priceHigh"
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

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (tags) {
      const tagsArray = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagsArray };
    }

    let sortOption = { createdAt: -1 }; // newest
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

    res.json({ course });
  } catch (err) {
    console.error("Error fetching course details:", err);
    res.status(500).json({ message: "Failed to fetch course details" });
  }
});

module.exports = router;
