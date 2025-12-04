// src/app/admin/courses/[courseId]/batches/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

// helper: format Date string to yyyy-MM-dd for input[type="date"]
const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export default function ManageBatchesPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state for add/edit
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // 🔒 Auth guard – admin only
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      router.push(`/login?redirect=/admin/courses/${courseId}/batches`);
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, checkingAuth, router, courseId]);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        `${API_BASE}/api/admin/courses/${courseId}`,
        { withCredentials: true }
      );

      setCourse(data);
    } catch (err) {
      console.error("Fetch course (batches) error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load course batches. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin" || checkingAuth) return;
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, checkingAuth, courseId]);

  const resetForm = () => {
    setName("");
    setStartDate("");
    setEndDate("");
    setEditingBatchId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startDate) {
      alert("Batch name and start date are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        startDate,
        endDate: endDate || undefined,
      };

      if (editingBatchId) {
        // update existing batch
        await axios.put(
          `${API_BASE}/api/admin/courses/${courseId}/batches/${editingBatchId}`,
          payload,
          { withCredentials: true }
        );
      } else {
        // create new batch
        await axios.post(
          `${API_BASE}/api/admin/courses/${courseId}/batches`,
          payload,
          { withCredentials: true }
        );
      }

      await fetchCourse();
      resetForm();
    } catch (err) {
      console.error("Save batch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save batch. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (batch) => {
    setEditingBatchId(batch._id);
    setName(batch.name || "");
    setStartDate(toDateInputValue(batch.startDate));
    setEndDate(toDateInputValue(batch.endDate));
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDelete = async (batchId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this batch? Enrollments linked to this batch may become inconsistent."
    );
    if (!ok) return;

    try {
      setDeletingId(batchId);
      setError("");

      await axios.delete(
        `${API_BASE}/api/admin/courses/${courseId}/batches/${batchId}`,
        { withCredentials: true }
      );

      await fetchCourse();
    } catch (err) {
      console.error("Delete batch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to delete batch. Please try again."
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              <Link
                href="/admin/courses"
                className="underline-offset-2 hover:underline"
              >
                ← Back to Courses
              </Link>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Manage Batches
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading
                ? "Loading course information..."
                : course
                ? `Course: ${course.title}`
                : "Course not found."}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Layout: form + list */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr,1fr] gap-6 items-start">
          {/* Batches list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Existing Batches
            </h2>

            {loading && (
              <p className="text-sm text-slate-500">Loading batches…</p>
            )}

            {!loading && course && (!course.batches || course.batches.length === 0) && (
              <p className="text-sm text-slate-500">
                No batches created yet. Use the form on the right to add one.
              </p>
            )}

            {!loading && course && course.batches && course.batches.length > 0 && (
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        Start
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">
                        End
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.batches.map((batch) => (
                      <tr
                        key={batch._id}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-3 py-2 align-top text-slate-900">
                          {batch.name}
                        </td>
                        <td className="px-3 py-2 align-top text-slate-700">
                          {batch.startDate
                            ? new Date(batch.startDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 align-top text-slate-700">
                          {batch.endDate
                            ? new Date(batch.endDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 align-top text-right">
                          <div className="inline-flex flex-wrap gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleEditClick(batch)}
                              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(batch._id)}
                              disabled={deletingId === batch._id}
                              className="px-2.5 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                            >
                              {deletingId === batch._id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Form: add / edit batch */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {editingBatchId ? "Edit Batch" : "Add New Batch"}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Define batch name and schedule (e.g., &quot;Batch 1 - January&quot;,
              starting from 1st January).
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Batch Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Batch 1 - Jan 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Start Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Date (optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? editingBatchId
                      ? "Saving changes..."
                      : "Creating..."
                    : editingBatchId
                    ? "Save Changes"
                    : "Create Batch"}
                </button>

                {editingBatchId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
