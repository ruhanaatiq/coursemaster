// src/app/courses/[id]/learn/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// 🔹 NEW: import the Assignment + Quiz section
import AssignmentAndQuizSection from "@/components/AssignmentAndQuizSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function CourseLearnPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams(); // { id: 'courseId' }
  const courseId = params?.id;

  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // 1) Auth guard
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      // send them to login then back here
      router.push(`/login?redirect=/courses/${courseId}/learn`);
      return;
    }
  }, [user, checkingAuth, router, courseId]);

  // 2) Fetch enrollment + course
  useEffect(() => {
    if (checkingAuth) return;
    if (!user || !courseId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE}/api/enrollments/by-course/${courseId}`,
          { withCredentials: true }
        );

        const enr = res.data.enrollment;
        setEnrollment(enr);
        setCourse(enr.course);

        // If the course has syllabus with order, sort it once
        if (enr.course?.syllabus?.length) {
          enr.course.syllabus.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
      } catch (err) {
        console.error("Learn page fetch error:", err);
        const msg =
          err?.response?.data?.message ||
          "Failed to load course. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, checkingAuth, courseId]);

  const lessons = useMemo(() => course?.syllabus || [], [course]);

  const activeLesson = lessons[activeLessonIndex] || null;
  const progress = enrollment?.progress || 0;

  const handleSelectLesson = (index) => {
    setActiveLessonIndex(index);
  };

  const handleCompleteLesson = async () => {
    if (!enrollment || !lessons.length) return;

    try {
      setUpdatingProgress(true);
      const totalLessons = lessons.length;

      // simple logic: each completed lesson adds equal percentage
      const step = 100 / totalLessons;

      // calculate new progress but don't exceed 100
      let newProgress = progress + step;
      if (newProgress > 100) newProgress = 100;

      const res = await axios.patch(
        `${API_BASE}/api/enrollments/${enrollment._id}/progress`,
        { progress: newProgress },
        { withCredentials: true }
      );

      setEnrollment(res.data.enrollment);

      // move to next lesson (if available)
      if (activeLessonIndex < totalLessons - 1) {
        setActiveLessonIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Update progress error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to update progress. Please try again."
      );
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Loading / error states
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading course…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500">{error}</p>
        <Link
          href={`/courses/${courseId}`}
          className="text-sm text-blue-600 underline"
        >
          Go back to course details
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Course not found.</p>
      </div>
    );
  }

  const isCompleted = enrollment?.status === "completed";

  // small helper for badge text
  const renderResourceTypeLabel = (type) => {
    const t = (type || "").toLowerCase();
    if (t === "video") return "VIDEO";
    if (t === "article") return "ARTICLE";
    if (t === "docs") return "DOCS";
    return "OTHER";
  };

  // 🔹 If you stored batchId on enrollment, grab it here
  const batchId = enrollment?.batchId || null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        {/* Left: Active lesson player */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">
            {course.category || "Course"}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            {course.title}
          </h1>
          <p className="text-xs text-slate-500 mb-4">
            by <span className="font-medium">{course.instructor}</span>
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Overall Progress</p>
              <p className="text-xs font-semibold text-slate-700">
                {progress.toFixed(0)}%
              </p>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {isCompleted && (
              <p className="mt-1 text-[11px] text-green-600 font-semibold">
                Course completed 🎉
              </p>
            )}
          </div>

          {/* Active lesson */}
          {activeLesson ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Lesson {activeLessonIndex + 1}: {activeLesson.title}
              </h2>

              {/* Video area */}
              <div className="aspect-video w-full bg-slate-900 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                {activeLesson.videoUrl ? (
                  <iframe
                    className="w-full h-full"
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <p className="text-xs text-slate-200">
                    No video for this lesson. Content is available below.
                  </p>
                )}
              </div>

              {activeLesson.description && (
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  {activeLesson.description}
                </p>
              )}

              {/* Extra resources */}
              {activeLesson.resources && activeLesson.resources.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Extra resources
                  </p>
                  <ul className="space-y-1">
                    {activeLesson.resources.map((res) => (
                      <li key={res._id || res.url}>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-slate-900 text-white uppercase tracking-wide">
                            {renderResourceTypeLabel(res.type)}
                          </span>
                          <span>{res.label || res.url}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 🔹 NEW: Assignment + Quiz for THIS lesson/module */}
              <div className="mt-4 mb-6">
                <AssignmentAndQuizSection
                  courseId={courseId}
                  // use lesson _id (or moduleId if that’s what you store in DB)
                  moduleId={
                    activeLesson._id ||
                    activeLesson.moduleId ||
                    String(activeLessonIndex)
                  }
                  batchId={batchId}
                />
              </div>

              {/* Complete lesson button */}
              <button
                onClick={handleCompleteLesson}
                disabled={updatingProgress || isCompleted}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {isCompleted
                  ? "Course already completed"
                  : updatingProgress
                  ? "Updating..."
                  : activeLessonIndex === lessons.length - 1
                  ? "Mark lesson & finish course"
                  : "Mark lesson complete & next"}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No lessons have been added to this course yet.
            </p>
          )}
        </div>

        {/* Right: Lessons list */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Lessons
          </h2>

          {lessons.length === 0 && (
            <p className="text-sm text-slate-500">
              Instructor hasn&apos;t added any lessons yet.
            </p>
          )}

          <ol className="space-y-2 text-sm">
            {lessons.map((lesson, idx) => {
              const isActive = idx === activeLessonIndex;
              const hasVideo = !!lesson.videoUrl;
              const hasResources =
                lesson.resources && lesson.resources.length > 0;

              return (
                <li key={lesson._id || idx}>
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(idx)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex flex-col gap-1 ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <span className="text-xs mr-2 text-slate-500">
                        {idx + 1}.
                      </span>
                      <span className="font-medium">{lesson.title}</span>
                    </div>

                    {/* tiny pills to show what the lesson has */}
                    <div className="flex flex-wrap gap-1">
                      {hasVideo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-white">
                          Video
                        </span>
                      )}
                      {hasResources && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Resources
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
