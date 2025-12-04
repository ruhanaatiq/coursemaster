// src/app/admin/enrollments/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AdminEnrollmentsPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [enrollments, setEnrollments] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState("");

  // 🔒 Auth guard – admin only
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      router.push("/login?redirect=/admin/enrollments");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard"); // non-admins back to student dashboard
    }
  }, [user, checkingAuth, router]);

  // Fetch all courses (admin view – includes batches)
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      setError("");

      const { data } = await axios.get(`${API_BASE}/api/admin/courses`, {
        withCredentials: true,
      });

      setCourses(data || []);
    } catch (err) {
      console.error("Admin courses fetch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load courses. Please try again."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin" || checkingAuth) return;
    fetchCourses();
  }, [user, checkingAuth]);

  // When course changes, reset batch & enrollments
  useEffect(() => {
    setSelectedBatchId("");
    setEnrollments([]);
  }, [selectedCourseId]);

  const fetchEnrollments = async () => {
    if (!selectedCourseId) {
      setEnrollments([]);
      return;
    }

    try {
      setLoadingEnrollments(true);
      setError("");

      const params = {
        courseId: selectedCourseId,
      };
      if (selectedBatchId) params.batchId = selectedBatchId;

      const { data } = await axios.get(`${API_BASE}/api/admin/enrollments`, {
        params,
        withCredentials: true,
      });

      setEnrollments(data || []);
    } catch (err) {
      console.error("Admin enrollments fetch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load enrollments. Please try again."
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Helper: currently selected course
  const currentCourse = courses.find((c) => c._id === selectedCourseId);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking your account…</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              <Link
                href="/admin"
                className="underline-offset-2 hover:underline"
              >
                ← Back to Admin Dashboard
              </Link>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Enrollments
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View all students enrolled in a specific course and batch.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-[2fr,2fr,auto] gap-4 items-end">
            {/* Course select */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Course<span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingCourses}
              >
                <option value="">
                  {loadingCourses ? "Loading courses..." : "Select a course"}
                </option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {currentCourse && (
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                  Instructor:{" "}
                  <span className="font-medium">
                    {currentCourse.instructor || "—"}
                  </span>
                </p>
              )}
            </div>

            {/* Batch select */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Batch (optional)
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!currentCourse}
              >
                <option value="">
                  {currentCourse
                    ? "All batches for this course"
                    : "Select a course first"}
                </option>
                {currentCourse?.batches?.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}{" "}
                    {batch.startDate
                      ? `(${new Date(batch.startDate).toLocaleDateString()})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply button */}
            <div className="flex md:justify-end">
              <button
                type="button"
                onClick={fetchEnrollments}
                disabled={!selectedCourseId || loadingEnrollments}
                className="w-full md:w-auto px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingEnrollments ? "Loading…" : "Load Enrollments"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedCourseId && (
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <p>
              Showing enrollments for{" "}
              <span className="font-medium">
                {currentCourse?.title || "selected course"}
              </span>{" "}
              {selectedBatchId && (
                <>
                  {" "}
                  · Batch:{" "}
                  <span className="font-medium">
                    {currentCourse?.batches?.find(
                      (b) => b._id === selectedBatchId
                    )?.name || "Selected batch"}
                  </span>
                </>
              )}
            </p>
            <p>
              Total enrollments:{" "}
              <span className="font-semibold">{enrollments.length}</span>
            </p>
          </div>
        )}

        {/* Enrollments table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Batch
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Progress
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Payment
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                  Enrolled At
                </th>
              </tr>
            </thead>
            <tbody>
              {/* No course selected */}
              {!selectedCourseId && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-5 text-center text-sm text-slate-500"
                  >
                    Select a course (and optionally a batch) to view enrollments.
                  </td>
                </tr>
              )}

              {/* Loading enrollments */}
              {selectedCourseId && loadingEnrollments && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-5 text-center text-sm text-slate-500"
                  >
                    Loading enrollments…
                  </td>
                </tr>
              )}

              {/* No results */}
              {selectedCourseId &&
                !loadingEnrollments &&
                enrollments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-5 text-center text-sm text-slate-500"
                    >
                      No enrollments found for the selected filters.
                    </td>
                  </tr>
                )}

              {/* Data rows */}
              {selectedCourseId &&
                !loadingEnrollments &&
                enrollments.map((en) => (
                  <tr
                    key={en._id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 align-top text-slate-900">
                      {en.student?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {en.student?.email || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">
                      {en.course?.title || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">
                      {(() => {
                        if (!selectedBatchId) {
                          // try to find by batchId from enrollment if you store it
                          // If you stored batchId on enrollment, you can show its name here
                          // For now show "—" or "All"
                          return en.batchId
                            ? currentCourse?.batches?.find(
                                (b) => b._id === en.batchId
                              )?.name || "—"
                            : "—";
                        }
                        const batch =
                          currentCourse?.batches?.find(
                            (b) => b._id === (en.batchId || selectedBatchId)
                          ) || null;
                        return batch?.name || "—";
                      })()}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {en.status || "enrolled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">
                      {typeof en.progress === "number"
                        ? `${en.progress}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          en.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {en.paymentStatus || "pending"}
                      </span>
                      {en.totalPrice > 0 && (
                        <span className="ml-1 text-xs text-slate-500">
                          (${en.totalPrice})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right text-slate-600">
                      {en.createdAt
                        ? new Date(en.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
