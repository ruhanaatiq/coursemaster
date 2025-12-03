const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["enrolled", "completed"],
      default: "enrolled",
    },
    progress: {
      type: Number, // 0–100
      default: 0,
    },

    // 🔹 Payment-related fields
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
      type: String, // later you can save Stripe paymentIntent id here
    },
  },
  { timestamps: true }
);

// avoid duplicate enrollment for same user+course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);