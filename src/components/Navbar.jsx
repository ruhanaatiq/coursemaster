"use client";

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/store/authSlice";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Dynamically choose dashboard route
  const dashboardRoute =
    user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CourseMaster
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-sm text-black font-medium items-center">
          <Link href="/">Home</Link>
          <Link href="/courses">Courses</Link>

          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {user && (
            <>
              {/* 👇 Fixed Dashboard Link */}
              <Link href={dashboardRoute}>Dashboard</Link>

              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-sm border px-3 py-1 rounded"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-3 text-sm font-medium">
          <Link href="/">Home</Link>
          <br />
          <Link href="/courses">Courses</Link>
          <br />

          {!user && (
            <>
              <Link href="/login">Login</Link>
              <br />
              <Link href="/register">Register</Link>
            </>
          )}

          {user && (
            <>
              {/* 👇 Mobile Dashboard Fix */}
              <Link href={dashboardRoute}>Dashboard</Link>
              <br />
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
