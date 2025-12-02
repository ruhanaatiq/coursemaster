"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// keep cookies (JWT)
axios.defaults.withCredentials = true;

export default function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔒 Role-based guard
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      // if a student somehow lands here, send them to student dashboard
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch admin stats from /api/admin/stats
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/api/admin/stats`);
        const data = res.data || {};

        setStats({
          totalCourses: data.totalCourses || 0,
          totalStudents: data.totalStudents || 0,
          totalAdmins: data.totalAdmins || 0,
          totalEnrollments: data.totalEnrollments || 0,
        });
      } catch (err) {
        console.error("Admin stats error:", err);
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // while redirecting / no user, don't flash anything
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-medium">{user.name}</span>.{" "}
              Manage courses and monitor activity here.
            </p>
          </div>

          {/* Small admin info pill */}
          <div className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs md:text-sm">
            Admin accounts: <span className="font-semibold">{stats.totalAdmins}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Courses */}
          <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Total Courses
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "…" : stats.totalCourses}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              All courses currently available on CourseMaster.
            </p>
          </div>

          {/* Total Students */}
          <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Total Students
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "…" : stats.totalStudents}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Registered students with access to courses.
            </p>
          </div>

          {/* Active Enrollments */}
          <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase">
              Active Enrollments
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {loading ? "…" : stats.totalEnrollments}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Total enrollments across all courses.
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Course Management
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Create new courses, update details, and manage published content.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/admin/courses"
                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                View All Courses
              </a>
              <a
                href="/admin/courses/new"
                className="px-3 py-1.5 text-sm rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Add New Course
              </a>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Students & Enrollments
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Later you can list all students, monitor enrollments, and track
              progress in detail.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-600 cursor-not-allowed"
              >
                View Students (coming soon)
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-600 cursor-not-allowed"
              >
                View Enrollments (coming soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
