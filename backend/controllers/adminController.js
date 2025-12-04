// backend/controllers/adminController.js
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

exports.adminStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalEnrollments = await Enrollment.countDocuments();

    res.json({
      totalCourses,
      totalStudents,
      totalAdmins,
      totalEnrollments,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
};
exports.adminEnrollmentTrend = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - (days - 1)); // include today

    // Aggregate counts by day
    const raw = await Enrollment.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Turn into a map for quick lookup
    const map = raw.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Build a continuous array (no missing days)
    const data = [];
    const cursor = new Date(fromDate);

    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10); // yyyy-mm-dd
      data.push({
        date: key,
        enrollments: map[key] || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    res.json(data);
  } catch (err) {
    console.error("adminEnrollmentTrend error:", err);
    res.status(500).json({ message: "Failed to load enrollment trend." });
  }
};