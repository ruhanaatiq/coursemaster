// src/app/dashboard/page.jsx (for students)
// you already marked it "use client"
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function StudentDashboardPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // if this page is only for students, you can optionally kick admins:
    // if (user.role === "admin") router.push("/admin/dashboard");
  }, [user, checkingAuth, router]);

  useEffect(() => {
    if (checkingAuth) return;
    if (!user) return;

    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(`${API_BASE}/api/enrollments/me`, {
          withCredentials: true,
        });

        setEnrollments(data.enrollments || []);
      } catch (err) {
        console.error(err);
        setError(
          err?.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, checkingAuth]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking your account...</p>
      </div>
    );
  }

  if (!user) return null;

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "completed"
  ).length;
  const inProgress = totalCourses - completedCourses;

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
            <p className="text-2xl font-bold text-slate-900">{totalCourses}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Completed Courses</p>
            <p className="text-2xl font-bold text-slate-900">
              {completedCourses}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">{inProgress}</p>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-sm text-slate-500 mb-4">
            Loading your enrolled courses...
          </p>
        )}
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

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
                const progress = enrollment.progress || 0;
                const isCompleted = enrollment.status === "completed";
                const paid = enrollment.paymentStatus === "paid";

                return (
                  <div
                    key={enrollment._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 rounded-lg px-3 py-3 gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.instructor && `by ${c.instructor}`} •{" "}
                        {c.category || "General"}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-2 w-full max-w-xs">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Progress: {progress}%{" "}
                          {isCompleted && (
                            <span className="text-green-600 font-semibold">
                              • Completed
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Payment status */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          paid
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {paid ? "Paid" : "Payment Pending"}
                      </span>

                      {/* Course status */}
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {isCompleted ? "Completed" : "In progress"}
                      </span>

                      {/* Continue button */}
                    <Link
  href={`/courses/${c._id}/learn`}
  className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
>
  {isCompleted ? "Review Course" : "Continue"}
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
