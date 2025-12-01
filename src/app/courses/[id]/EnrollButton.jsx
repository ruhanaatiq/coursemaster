"use client";

import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function EnrollButton({ courseId }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const handleEnroll = async () => {
    // Not logged in -> go to login with redirect back to this course
    if (!user) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    // Logged in -> call backend enroll API (you’ll implement later)
    try {
      await axios.post(
        `${API_BASE}/api/enrollments`,
        { courseId },
        { withCredentials: true }
      );

      // After successful enroll: go to dashboard (or course consumption page)
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to enroll. Please try again.");
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
