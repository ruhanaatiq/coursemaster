// src/app/courses/[id]/Enrollbutton.jsx
"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function EnrollButton({ courseId }) {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/api/enrollments`,
        { courseId },
        { withCredentials: true }
      );

      console.log("Enroll response:", res.data);

      // Later you can redirect to a "Payment" page if paymentStatus === "pending".
      alert(res.data.message || "Enrolled successfully!");

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Failed to enroll. Please try again.";
      alert(msg);
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
