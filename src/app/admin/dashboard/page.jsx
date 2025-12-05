"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

// 🔹 Recharts imports
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AdminDashboardPage() {
  const { user, checkingAuth } = useSelector((state) => state.auth);
  const router = useRouter();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 NEW: chart state
  const [enrollmentTrend, setEnrollmentTrend] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // 🔒 Role-based guard – but WAIT until auth check is done
  useEffect(() => {
    if (checkingAuth) return; // still checking JWT / localStorage

    if (!user) {
      // no user after check → send to login
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      // logged in but not admin → student dashboard
      router.push("/dashboard");
    }
  }, [user, checkingAuth, router]);

  // Fetch admin stats from /api/admin/stats
  useEffect(() => {
    if (checkingAuth) return; // don't call API until auth known
    if (!user || user.role !== "admin") return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/api/admin/stats`, {
          withCredentials: true,
        });
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
  }, [user, checkingAuth]);

  // 🔹 NEW: fetch enrollment trend for chart
  useEffect(() => {
    if (checkingAuth) return;
    if (!user || user.role !== "admin") return;

    const fetchTrend = async () => {
      try {
        setTrendLoading(true);

        const res = await axios.get(
          `${API_BASE}/api/admin/enrollments-over-time?days=30`,
          { withCredentials: true }
        );

        // API returns [{ date: "2025-12-01", enrollments: 5 }, ...]
        setEnrollmentTrend(res.data || []);
      } catch (err) {
        console.error("Enrollment trend error:", err);
        // keep dashboard usable even if chart fails
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrend();
  }, [user, checkingAuth]);

  // While we are still checking auth globally
  if (checkingAuth) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-sm text-slate-500">Checking permissions...</p>
      </div>
    );
  }

  // After check: if not admin, component shows nothing (redirect is already in effect)
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
            Admin accounts:{" "}
            <span className="font-semibold">{stats.totalAdmins}</span>
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

        {/* 🔹 NEW: Enrollment chart */}
        <div className="mb-8 bg-white shadow-sm rounded-xl border border-slate-100 p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Enrollments (last 30 days)
              </h2>
              <p className="text-xs text-slate-500">
                Daily enrollments across all courses.
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
              Analytics
            </span>
          </div>

          {trendLoading ? (
            <p className="text-xs text-slate-500">Loading chart…</p>
          ) : enrollmentTrend.length === 0 ? (
            <p className="text-xs text-slate-500">
              No enrollments recorded in the selected period.
            </p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(d) => d.slice(5)} // show MM-DD
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10 }}
                    width={30}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} enrollments`, "Enrollments"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick actions (same as before) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Course Management
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Create new courses, update details, and manage published content.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/courses"
                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                View All Courses
              </Link>
              <Link
                href="/admin/courses/new"
                className="px-3 py-1.5 text-sm rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Add New Course
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-5 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Students & Enrollments
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              View all course enrollments and track student progress.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/enrollments"
                className="px-3 py-1.5 text-sm rounded border border-slate-300 text-white bg-blue-600 hover:bg-slate-100"
              >
                View Enrollments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
