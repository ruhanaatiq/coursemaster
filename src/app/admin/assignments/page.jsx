// src/app/admin/assignments/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AdminAssignmentsPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted"); // submitted | reviewed | all

  const [submissions, setSubmissions] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState("");

  // review form state
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewScore, setReviewScore] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // 🔒 Auth guard – admin only
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      router.push("/login?redirect=/admin/assignments");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, checkingAuth, router]);

  // Fetch all courses (for filters)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, checkingAuth]);

  // reset batch & submissions when course changes
  useEffect(() => {
    setSelectedBatchId("");
    setSubmissions([]);
    setReviewingId(null);
  }, [selectedCourseId]);

  const fetchSubmissions = async () => {
    if (!selectedCourseId) {
      setSubmissions([]);
      return;
    }

    try {
      setLoadingSubmissions(true);
      setError("");

      const params = {
        courseId: selectedCourseId,
      };
      if (selectedBatchId) params.batchId = selectedBatchId;
      if (statusFilter !== "all") params.status = statusFilter;

      const { data } = await axios.get(`${API_BASE}/api/admin/assignments`, {
        params,
        withCredentials: true,
      });

      setSubmissions(data || []);
    } catch (err) {
      console.error("Admin assignments fetch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load assignment submissions. Please try again."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const currentCourse = courses.find((c) => c._id === selectedCourseId);

  const handleStartReview = (submission) => {
    setReviewingId(submission._id);
    setReviewScore(
      typeof submission.score === "number" ? String(submission.score) : ""
    );
    setReviewFeedback(submission.feedback || "");
  };

  const handleCancelReview = () => {
    setReviewingId(null);
    setReviewScore("");
    setReviewFeedback("");
  };

  const handleSaveReview = async (submissionId) => {
    const parsedScore =
      reviewScore === "" ? null : Number.parseFloat(reviewScore);

    if (reviewScore !== "" && Number.isNaN(parsedScore)) {
      alert("Score must be a number or left empty.");
      return;
    }

    try {
      setSavingReview(true);
      setError("");

      const payload = {
        feedback: reviewFeedback || "",
        status: "reviewed",
      };
      if (parsedScore !== null) payload.score = parsedScore;

      await axios.patch(
        `${API_BASE}/api/admin/assignments/${submissionId}`,
        payload,
        { withCredentials: true }
      );

      await fetchSubmissions();
      handleCancelReview();
    } catch (err) {
      console.error("Save review error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to save review. Please try again."
      );
    } finally {
      setSavingReview(false);
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
            <p className="text-xs text-slate-500 mb-1">
              <Link
                href="/admin"
                className="underline-offset-2 hover:underline"
              >
                ← Back to Admin Dashboard
              </Link>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Assignment Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review student assignments, give scores, and share feedback.
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
          <div className="grid grid-cols-1 md:grid-cols-[2fr,2fr,1.2fr,auto] gap-4 items-end">
            {/* Course select */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Course<span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="submitted">Submitted (pending review)</option>
                <option value="reviewed">Reviewed</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Apply */}
            <div className="flex md:justify-end">
              <button
                type="button"
                onClick={fetchSubmissions}
                disabled={!selectedCourseId || loadingSubmissions}
                className="w-full md:w-auto px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingSubmissions ? "Loading…" : "Load Submissions"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedCourseId && (
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <p>
              Showing submissions for{" "}
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
              )}{" "}
              · Status:{" "}
              <span className="font-medium">
                {statusFilter === "all"
                  ? "All"
                  : statusFilter === "submitted"
                  ? "Submitted"
                  : "Reviewed"}
              </span>
            </p>
            <p>
              Total submissions:{" "}
              <span className="font-semibold">{submissions.length}</span>
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm align-top">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Course
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Batch
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Module
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Answer / Link
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-500">
                  Score
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                  Submitted At
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* No course selected */}
              {!selectedCourseId && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-5 text-center text-sm text-slate-500"
                  >
                    Select filters above and click &quot;Load Submissions&quot;.
                  </td>
                </tr>
              )}

              {/* Loading */}
              {selectedCourseId && loadingSubmissions && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-5 text-center text-sm text-slate-500"
                  >
                    Loading submissions…
                  </td>
                </tr>
              )}

              {/* No results */}
              {selectedCourseId &&
                !loadingSubmissions &&
                submissions.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-5 text-center text-sm text-slate-500"
                    >
                      No submissions found for the selected filters.
                    </td>
                  </tr>
                )}

              {/* Data rows */}
              {selectedCourseId &&
                !loadingSubmissions &&
                submissions.map((sub) => {
                  const batchName =
                    currentCourse?.batches?.find(
                      (b) => b._id === sub.batchId
                    )?.name || "—";

                  const isReviewing = reviewingId === sub._id;

                  return (
                    <tr
                      key={sub._id}
                      className="border-t border-slate-100 hover:bg-slate-50/80 align-top"
                    >
                      <td className="px-4 py-3 text-slate-900">
                        <div className="font-medium">
                          {sub.student?.name || "Unknown student"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sub.student?.email || "—"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {sub.course?.title || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {batchName}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700">
                          {sub.moduleId || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 max-w-xs">
                        {sub.answerText && (
                          <p className="text-xs text-slate-700 line-clamp-3 mb-1">
                            {sub.answerText}
                          </p>
                        )}
                        {sub.driveLink && (
                          <a
                            href={sub.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline"
                          >
                            Open submitted file
                          </a>
                        )}
                        {!sub.answerText && !sub.driveLink && (
                          <span className="text-xs text-slate-400">
                            No answer provided.
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            sub.status === "reviewed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {sub.status || "submitted"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {typeof sub.score === "number"
                          ? sub.score
                          : "Not graded"}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-600">
                        {sub.createdAt
                          ? new Date(sub.createdAt).toLocaleString()
                          : "—"}
                      </td>

                      {/* Actions + Review form */}
                      <td className="px-4 py-3 text-right align-top">
                        {/* Buttons */}
                        <div className="flex flex-col items-end gap-2">
                          {isReviewing ? (
                            <>
                              <div className="w-52 sm:w-64 bg-slate-50 border border-slate-200 rounded-lg p-3 text-left">
                                <div className="mb-2">
                                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Score (optional)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={reviewScore}
                                    onChange={(e) =>
                                      setReviewScore(e.target.value)
                                    }
                                    placeholder="e.g. 85"
                                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                                <div className="mb-2">
                                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                                    Feedback
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={reviewFeedback}
                                    onChange={(e) =>
                                      setReviewFeedback(e.target.value)
                                    }
                                    placeholder="Write feedback for the student..."
                                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={handleCancelReview}
                                    className="px-2.5 py-1 text-[11px] rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={savingReview}
                                    onClick={() =>
                                      handleSaveReview(sub._id)
                                    }
                                    className="px-2.5 py-1 text-[11px] rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
                                  >
                                    {savingReview ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleStartReview(sub)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              {sub.status === "reviewed"
                                ? "Edit Review"
                                : "Review"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
