"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest"); // priceLow, priceHigh, newest
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limit = 6; // courses per page

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        sort,
      };

      const { data } = await axios.get(`${API_BASE}/api/courses`, { params });

      setCourses(data.courses || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, category]); // search is triggered manually

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Browse Courses
            </h1>
            <p className="text-sm text-slate-500">
              Search, filter, and enroll in high-quality courses.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
          >
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Search by title or instructor
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. React, JavaScript, Design..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="web-development">Web Development</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="data-science">Data Science</option>
              </select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-44">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Sort by
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            {/* Mobile Search Button */}
            <button
              type="submit"
              className="mt-1 md:mt-5 inline-flex sm:hidden justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              Search
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-1 md:mt-5 inline-flex justify-center px-3 py-2 rounded-lg border border-slate-200 text-xs md:text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
          </form>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Loading courses...
          </p>
        )}

        {error && !loading && (
          <p className="text-center text-sm text-red-500 mt-6">{error}</p>
        )}

        {/* Course Grid */}
        {!loading && !error && courses.length === 0 && (
          <p className="text-center text-sm text-slate-500 mt-6">
            No courses found. Try adjusting filters.
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">
                  {course.category || "General"}
                </p>
                <h2 className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {course.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  by{" "}
                  <span className="font-medium">
                    {course.instructor || "Unknown Instructor"}
                  </span>
                </p>

                <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                  {course.description}
                </p>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[11px] rounded-full bg-blue-50 text-blue-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900">
                  {course.price && course.price > 0 ? (
                    <>${course.price}</>
                  ) : (
                    <span className="text-green-600">Free</span>
                  )}
                </p>
                <Link
                  href={`/courses/${course._id}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => (p < totalPages ? p + 1 : totalPages))
              }
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
