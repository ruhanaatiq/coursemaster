"use client";

import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Keep cookies (JWT) when backend sets them
axios.defaults.withCredentials = true;

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_BASE}/api/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // Backend should return: { user, token, message }
      dispatch(setUser(data.user));

      // Redirect to student dashboard after registration
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Top bar */}
      <header className="w-full border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-semibold">
              CM
            </span>
            <span className="text-base md:text-lg font-semibold text-slate-900">
              CourseMaster
            </span>
          </Link>
          <p className="hidden sm:block text-xs md:text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left side – hero/info */}
          <section className="hidden md:block">
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-4">
              Start your{" "}
              <span className="text-blue-600">learning journey</span> today.
            </h1>
            <p className="text-sm md:text-base text-slate-600 mb-6 max-w-md">
              Create a free CourseMaster account and get access to structured
              courses, hands-on lessons, and progress tracking designed for
              aspiring developers and lifelong learners.
            </p>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center">
                  ✓
                </span>
                <p>Enroll in curated courses built for modern tech skills.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center">
                  ✓
                </span>
                <p>Track your lessons, quizzes and overall course progress.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center">
                  ✓
                </span>
                <p>Learn at your own pace with 24/7 access to materials.</p>
              </div>
            </div>

            <div className="mt-8 hidden lg:flex items-center gap-6 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  Build real skills
                </p>
                <p>Practice-based learning with project-oriented content.</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="font-semibold text-slate-700 text-sm">
                  Learn from anywhere
                </p>
                <p>Access your courses on any device, anytime.</p>
              </div>
            </div>
          </section>

          {/* Right side – register card */}
          <section className="flex justify-center">
            <div className="w-full max-w-md bg-white/90 backdrop-blur shadow-xl shadow-slate-200/60 rounded-2xl p-6 md:p-7 border border-slate-100">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1 text-center">
                Create your student account
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mb-4 text-center">
                It only takes a minute to get started.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs md:text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Re-enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-1 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs md:text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Log in
                </Link>
              </p>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                By signing up, you agree to CourseMaster&apos;s{" "}
                <span className="underline decoration-dotted">
                  Terms of Use
                </span>{" "}
                and{" "}
                <span className="underline decoration-dotted">
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
