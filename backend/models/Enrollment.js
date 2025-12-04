const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    // 🔹 Student who enrolled
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Which course they enrolled in
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // 🔹 NEW: Track batch of the course
    batchId: {
      type: mongoose.Schema.Types.ObjectId, // refers to Course.batches._id
      required: false,
    },

    // 🔹 Enrollment status
    status: {
      type: String,
      enum: ["enrolled", "completed", "cancelled"],
      default: "enrolled",
    },

    // 🔹 Student’s course progress
    progress: {
      type: Number, // 0–100
      min: 0,
      max: 100,
      default: 0,
    },

    // ===========================
    // 🔹 PAYMENT DETAILS
    // ===========================

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    transactionId: {
      type: String, // Stripe / SSLCOMMERZ / manual reference
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment for same student + same course
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
