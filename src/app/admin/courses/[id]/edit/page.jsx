"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AdminEditCoursePage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    instructor: "",
    category: "web-development",
    price: "",
    tagsInput: "",
  });

  const [lessons, setLessons] = useState([
    {
      title: "",
      description: "",
      videoUrl: "",
      resources: [
        {
          type: "article",
          label: "",
          url: "",
        },
      ],
    },
  ]);

  // 🔒 Auth guard
  useEffect(() => {
    if (checkingAuth) return;

    if (!user) {
      router.push(`/login?redirect=/admin/courses/${courseId}/edit`);
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, checkingAuth, router, courseId]);

  // Fetch current course
  useEffect(() => {
    if (!user || user.role !== "admin" || checkingAuth || !courseId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/api/courses/${courseId}`);
        const { course } = res.data;

        if (!course) {
          setError("Course not found.");
          return;
        }

        setCourseForm({
          title: course.title || "",
          description: course.description || "",
          instructor: course.instructor || "",
          category: course.category || "web-development",
          price: course.price ?? "",
          tagsInput: Array.isArray(course.tags)
            ? course.tags.join(", ")
            : "",
        });

        if (Array.isArray(course.syllabus) && course.syllabus.length > 0) {
          const sorted = [...course.syllabus].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
          );
          setLessons(
            sorted.map((lesson) => ({
              title: lesson.title || "",
              description: lesson.description || "",
              videoUrl: lesson.videoUrl || "",
              resources: Array.isArray(lesson.resources) && lesson.resources.length
                ? lesson.resources.map((r) => ({
                    type: r.type || "article",
                    label: r.label || "",
                    url: r.url || "",
                  }))
                : [
                    {
                      type: "article",
                      label: "",
                      url: "",
                    },
                  ],
            }))
          );
        } else {
          // fallback: one empty lesson
          setLessons([
            {
              title: "",
              description: "",
              videoUrl: "",
              resources: [
                {
                  type: "article",
                  label: "",
                  url: "",
                },
              ],
            },
          ]);
        }
      } catch (err) {
        console.error("Fetch course error:", err);
        setError(
          err?.response?.data?.message || "Failed to load course for editing."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [user, checkingAuth, courseId]);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLessonFieldChange = (index, field, value) => {
    setLessons((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleResourceChange = (lessonIdx, resIdx, field, value) => {
    setLessons((prev) => {
      const copy = [...prev];
      const lesson = { ...copy[lessonIdx] };
      const resources = [...(lesson.resources || [])];
      resources[resIdx] = {
        ...resources[resIdx],
        [field]: value,
      };
      lesson.resources = resources;
      copy[lessonIdx] = lesson;
      return copy;
    });
  };

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        videoUrl: "",
        resources: [
          {
            type: "article",
            label: "",
            url: "",
          },
        ],
      },
    ]);
  };

  const removeLesson = (index) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const addResource = (lessonIdx) => {
    setLessons((prev) => {
      const copy = [...prev];
      const lesson = { ...copy[lessonIdx] };
      const resources = [...(lesson.resources || [])];
      resources.push({
        type: "article",
        label: "",
        url: "",
      });
      lesson.resources = resources;
      copy[lessonIdx] = lesson;
      return copy;
    });
  };

  const removeResource = (lessonIdx, resIdx) => {
    setLessons((prev) => {
      const copy = [...prev];
      const lesson = { ...copy[lessonIdx] };
      const resources = (lesson.resources || []).filter(
        (_, i) => i !== resIdx
      );
      lesson.resources = resources.length
        ? resources
        : [
            {
              type: "article",
              label: "",
              url: "",
            },
          ];
      copy[lessonIdx] = lesson;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const tags = courseForm.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const finalSyllabus = lessons.map((lesson, idx) => ({
        title: (lesson.title || "").trim() || `Lesson ${idx + 1}`,
        description: lesson.description || "",
        order: idx + 1,
        videoUrl: lesson.videoUrl || "",
        resources: (lesson.resources || [])
          .filter((r) => r.url && r.url.trim())
          .map((r) => ({
            type: r.type || "article",
            label: r.label || "Resource",
            url: r.url.trim(),
          })),
      }));

      const payload = {
        title: courseForm.title,
        description: courseForm.description,
        instructor: courseForm.instructor,
        category: courseForm.category,
        price: Number(courseForm.price) || 0,
        tags,
        syllabus: finalSyllabus,
      };

      const res = await axios.put(
        `${API_BASE}/api/courses/${courseId}`,
        payload,
        { withCredentials: true }
      );

      setSuccess("Course updated successfully!");
      console.log("Updated course:", res.data.course);

      // optional redirect
      // setTimeout(() => router.push("/admin/courses"), 800);
    } catch (err) {
      console.error("Update course error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to update course. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading course…</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Edit Course
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Update course details, lessons, and resources.
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={courseForm.title}
                onChange={handleCourseChange}
                required
                className="w-full border text-black border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Instructor
              </label>
              <input
                type="text"
                name="instructor"
                value={courseForm.instructor}
                onChange={handleCourseChange}
                required
                className="w-full border text-black border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category & Price */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Category
              </label>
              <select
                name="category"
                value={courseForm.category}
                onChange={handleCourseChange}
                className="w-full border border-slate-200 text-shadow-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="web-development">Web Development</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="data-science">Data Science</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                name="price"
                min="0"
                value={courseForm.price}
                onChange={handleCourseChange}
                className="w-full border text-black border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-black font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tagsInput"
              value={courseForm.tagsInput}
              onChange={handleCourseChange}
              className="w-full border text-black border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="react, javascript, frontend"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-black font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={courseForm.description}
              onChange={handleCourseChange}
              rows={3}
              className="w-full border border-slate-200 text-black rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lessons */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Lessons & Resources
              </h2>
              <button
                type="button"
                onClick={addLesson}
                className="text-xs px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                + Add Lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50/60"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Lesson {idx + 1}
                    </p>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(idx)}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs text-black font-medium mb-1">
                        Lesson Title
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          handleLessonFieldChange(idx, "title", e.target.value)
                        }
                        className="w-full border text-black border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-black font-medium mb-1">
                        Video URL (YouTube, etc.)
                      </label>
                      <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          handleLessonFieldChange(
                            idx,
                            "videoUrl",
                            e.target.value
                          )
                        }
                        placeholder="https://youtube.com/..."
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block text-xs text-black font-medium mb-1">
                      Lesson Description
                    </label>
                    <textarea
                      value={lesson.description}
                      onChange={(e) =>
                        handleLessonFieldChange(
                          idx,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full border text-black border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Resources */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold text-slate-700">
                        Additional Resources
                      </p>
                      <button
                        type="button"
                        onClick={() => addResource(idx)}
                        className="text-[11px] text-blue-600 hover:underline"
                      >
                        + Add Resource
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(lesson.resources || []).map((res, rIdx) => (
                        <div
                          key={rIdx}
                          className="grid gap-2 md:grid-cols-[0.9fr,2fr,auto] items-center"
                        >
                          <select
                            value={res.type}
                            onChange={(e) =>
                              handleResourceChange(
                                idx,
                                rIdx,
                                "type",
                                e.target.value
                              )
                            }
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                          </select>
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              value={res.label}
                              onChange={(e) =>
                                handleResourceChange(
                                  idx,
                                  rIdx,
                                  "label",
                                  e.target.value
                                )
                              }
                              placeholder="Resource title (e.g. MDN – JS Guide)"
                              className="w-full border border-slate-200 text-black rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={res.url}
                              onChange={(e) =>
                                handleResourceChange(
                                  idx,
                                  rIdx,
                                  "url",
                                  e.target.value
                                )
                              }
                              placeholder="https://..."
                              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeResource(idx, rIdx)}
                            className="text-[11px] text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
