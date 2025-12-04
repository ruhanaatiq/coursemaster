"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AdminNewCoursePage() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    category: "web-development",
    tags: "",
  });

  const [lessons, setLessons] = useState([
    {
      title: "",
      videoUrl: "",
      description: "",
      resourcesText: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/admin/courses/new");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLessonChange = (index, field, value) => {
    setLessons((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddLesson = () => {
    setLessons((prev) => [
      ...prev,
      { title: "", videoUrl: "", description: "", resourcesText: "" },
    ]);
  };

  const handleRemoveLesson = (index) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const inferResourceType = (url) => {
    const lower = url.toLowerCase();
    if (
      lower.includes("youtube.com") ||
      lower.includes("youtu.be") ||
      lower.includes("vimeo.com")
    ) {
      return "video";
    }
    if (lower.includes("docs.google.com")) return "docs";
    return "article";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const tagsArray =
        form.tags.trim() === ""
          ? []
          : form.tags.split(",").map((t) => t.trim());

      const syllabus = lessons
        .filter((l) => l.title.trim() !== "")
        .map((l, index) => {
          const resources = (l.resourcesText || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((url, idx) => ({
              type: inferResourceType(url),
              label: `Resource ${idx + 1}`,
              url,
            }));

          return {
            title: l.title.trim(),
            videoUrl: l.videoUrl.trim() || undefined,
            description: l.description.trim() || "",
            order: index + 1,
            resources,
          };
        });

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        instructor: form.instructor.trim(),
        price: Number(form.price) || 0,
        category: form.category,
        tags: tagsArray,
        syllabus,
      };

      const { data } = await axios.post(`${API_BASE}/api/courses`, payload, {
        withCredentials: true,
      });

      setSuccess("Course created successfully!");
      console.log("Created course:", data.course);

      setForm({
        title: "",
        description: "",
        instructor: "",
        price: "",
        category: "web-development",
        tags: "",
      });
      setLessons([
        {
          title: "",
          videoUrl: "",
          description: "",
          resourcesText: "",
        },
      ]);
    } catch (err) {
      console.error("Create course error:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to create course. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-slate-100 pt-24 px-4 pb-12 text-slate-900">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Add New Course
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Create a new course for students to browse and enroll.
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. React for Beginners"
              />
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800">
                Instructor
              </label>
              <input
                type="text"
                name="instructor"
                value={form.instructor}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Ruhana Atiq"
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-800">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="web-development">Web Development</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="data-science">Data Science</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-800">
                  Price (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 49"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="react, javascript, frontend"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-800">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write a short summary of the course..."
              />
            </div>
          </div>

          {/* Lessons / Syllabus */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Lessons (Syllabus)
              </h2>
              <button
                type="button"
                onClick={handleAddLesson}
                className="text-xs px-3 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                + Add Lesson
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              For each lesson you can attach a main video URL and multiple extra
              resources like articles or documentation links.
            </p>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={index}
                  className="border border-slate-300 rounded-lg p-3 bg-slate-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-800">
                      Lesson {index + 1}
                    </p>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(index)}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium mb-1 text-slate-800">
                        Lesson Title *
                      </label>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) =>
                          handleLessonChange(index, "title", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Introduction to JSX"
                        required={index === 0}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium mb-1 text-slate-800">
                        Video URL (YouTube, Vimeo, etc.)
                      </label>
                      <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          handleLessonChange(index, "videoUrl", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://youtube.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium mb-1 text-slate-800">
                        Lesson Description (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={lesson.description}
                        onChange={(e) =>
                          handleLessonChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What will students learn in this lesson?"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium mb-1 text-slate-800">
                        Extra Resources (one URL per line)
                      </label>
                      <textarea
                        rows={2}
                        value={lesson.resourcesText}
                        onChange={(e) =>
                          handleLessonChange(
                            index,
                            "resourcesText",
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`https://react.dev/learn/writing-markup-with-jsx
https://blog.example.com/great-article`}
                      />
                      <p className="mt-1 text-[10px] text-slate-500">
                        Each line becomes a clickable resource under this
                        lesson. Type both article and YouTube links here.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </form>
      </div>
    </div>
  );
}
