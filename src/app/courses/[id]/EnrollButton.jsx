"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function EnrollButton({ courseId }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!user) {
      // User not logged in → go to login page, then come back to course
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    // If user IS logged in → enroll
    try {
      const res = await axios.post(
        `${API_BASE}/api/enrollments`,
        { courseId },
        { withCredentials: true }
      );

      router.push("/dashboard"); // or course content page
    } catch (err) {
      console.error("Enroll error:", err);
      alert("Enrollment failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleEnroll}
      className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
    >
      Enroll Now
    </button>
  );
}
