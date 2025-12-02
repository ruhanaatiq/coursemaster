"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// make sure cookies are sent
axios.defaults.withCredentials = true;

export default function AdminNewCoursePage() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    syllabus: "",
    price: "",
    category: "web-development",
    tags: "", // comma separated
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔐 Route guard – only admin can access
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        tags:
          form.tags.trim() === ""
            ? []
            : form.tags.split(",").map((t) => t.trim()),
      };

      const { data } = await axios.post(`${API_BASE}/api/courses`, payload, {
        withCredentials: true,
      });

      setSuccess("Course created successfully!");
      console.log("Created course:", data.course);

      // reset form
      setForm({
        title: "",
        description: "",
        instructor: "",
        syllabus: "",
        price: "",
        category: "web-development",
        tags: "",
      });

      // optional: redirect to course list after a short delay
      // setTimeout(() => router.push("/courses"), 800);
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

  // while redirecting / checking role
  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Add New Course
        </h1>
        <p className="text-sm text-slate-500 mb-4">
          Create a new course for students to browse and enroll.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React for Beginners"
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Instructor
            </label>
            <input
              type="text"
              name="instructor"
              value={form.instructor}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Ruhana Atiq"
            />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="web-development">Web Development</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="data-science">Data Science</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 49"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="react, javascript, frontend"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write a short summary of the course..."
            />
          </div>

          {/* Syllabus */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Syllabus / Topics
            </label>
            <textarea
              name="syllabus"
              value={form.syllabus}
              onChange={handleChange}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List the main modules or topics covered..."
            />
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
