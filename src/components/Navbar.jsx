"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CourseMaster
        </Link>

        <div className="hidden md:flex gap-4 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/courses">Courses</Link>

          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {user && <Link href="/dashboard">Dashboard</Link>}
        </div>

        {/* simple mobile toggle just to avoid unused state */}
        <button
          className="md:hidden text-sm border px-3 py-1 rounded"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-4 space-y-2 text-sm font-medium">
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
              <Link href="/dashboard">Dashboard</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
