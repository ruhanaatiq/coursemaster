"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function StudentDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (!user) {
      // not logged in -> go to login
      router.push("/login");
      return;
    }

    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          `${API_BASE}/api/enrollments/my`,
          { withCredentials: true }
        );

        setEnrollments(data.enrollments || []);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, router]);

  if (!user) {
    // brief placeholder while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Student Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold">{user.name}</span>.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Enrolled Courses</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalCourses}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Completed Courses</p>
            <p className="text-2xl font-bold text-slate-900">
              {completedCourses}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalCourses - completedCourses}
            </p>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-sm text-slate-500 mb-4">
            Loading your enrolled courses...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Enrolled courses list */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Your Enrolled Courses
          </h2>

          {!loading && enrollments.length === 0 && (
            <p className="text-sm text-slate-500">
              You haven&apos;t enrolled in any course yet.{" "}
              <Link href="/courses" className="text-blue-600 underline">
                Browse courses
              </Link>
              .
            </p>
          )}

          {enrollments.length > 0 && (
            <div className="space-y-3">
              {enrollments.map((enrollment) => {
                const c = enrollment.course || {};
                return (
                  <div
                    key={enrollment._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded-lg px-3 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.instructor && `by ${c.instructor}`} •{" "}
                        {c.category || "General"}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {enrollment.status === "completed"
                          ? "Completed"
                          : "In progress"}
                      </span>
                      <span className="text-xs text-slate-500">
                        Progress: {enrollment.progress || 0}%
                      </span>
                      <Link
                        href={`/courses/${c._id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
