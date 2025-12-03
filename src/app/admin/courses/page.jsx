// src/app/admin/courses/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AdminCoursesPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // 🔒 Auth guard – admin only
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      router.push("/login?redirect=/admin/courses");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard"); // send students back
    }
  }, [user, checkingAuth, router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        sort: "newest",
      };

      const { data } = await axios.get(`${API_BASE}/api/courses`, {
        params,
        withCredentials: true,
      });

      setCourses(data.courses || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Admin courses fetch error:", err);
      setError(
        err?.response?.data?.message || "Failed to load courses. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin" || checkingAuth) return;
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, checkingAuth, page]);

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this course? This will also remove its enrollments."
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      await axios.delete(`${API_BASE}/api/courses/${id}`, {
        withCredentials: true,
      });

      // re-fetch list after delete
      await fetchCourses();
    } catch (err) {
      console.error("Delete course error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to delete course. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Manage Courses
            </h1>
            <p className="text-sm text-slate-500">
              View, edit, and delete courses available on CourseMaster.
            </p>
          </div>

          <Link
            href="/admin/courses/new"
            className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            + Add New Course
          </Link>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  Instructor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-5 text-center text-sm text-slate-500"
                  >
                    Loading courses…
                  </td>
                </tr>
              )}

              {!loading && courses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-5 text-center text-sm text-slate-500"
                  >
                    No courses found.
                  </td>
                </tr>
              )}

              {!loading &&
                courses.map((course) => (
                  <tr
                    key={course._id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-slate-900 line-clamp-2">
                        {course.title}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {course.instructor || "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {course.category || "General"}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-900">
                      {course.price && course.price > 0 ? (
                        <>${course.price}</>
                      ) : (
                        <span className="text-green-600 text-xs font-semibold">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-right">
                      <div className="inline-flex gap-2">
                        {/* Edit – you can create this page next */}
                        <Link
                          href={`/admin/courses/${course._id}/edit`}
                          className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Edit
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(course._id)}
                          disabled={deletingId === course._id}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                        >
                          {deletingId === course._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => (p < totalPages ? p + 1 : totalPages))
              }
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
