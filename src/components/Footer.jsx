"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        {/* 1️⃣ Logo + About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h1 className="text-2xl font-bold text-white">CourseMaster</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Learn new skills with expert-led courses, real-world projects, and
            hands-on assignments. Upgrade your future — one course at a time.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-5">
            <a href="#" className="text-xl hover:text-white transition">
              <FaFacebook />
            </a>
            <a href="#" className="text-xl hover:text-white transition">
              <FaInstagram />
            </a>
            <a href="#" className="text-xl hover:text-white transition">
              <FaLinkedin />
            </a>
            <a href="#" className="text-xl hover:text-white transition">
              <FaYoutube />
            </a>
          </div>
        </motion.div>

        {/* 2️⃣ Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/courses" className="hover:text-white">All Courses</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
          </ul>
        </motion.div>

        {/* 3️⃣ Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/courses?category=web" className="hover:text-white">Web Development</Link></li>
            <li><Link href="/courses?category=design" className="hover:text-white">UI/UX Design</Link></li>
            <li><Link href="/courses?category=data" className="hover:text-white">Data Science</Link></li>
            <li><Link href="/courses?category=business" className="hover:text-white">Business</Link></li>
          </ul>
        </motion.div>

        {/* 4️⃣ Subscribe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-sm text-slate-400 mb-3">
            Get notified about new courses and special discounts.
          </p>

          <form className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 w-full rounded-l-lg bg-slate-800 text-slate-300 outline-none border border-slate-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg text-sm"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 mt-12 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} CourseMaster — All rights reserved.
      </div>
    </footer>
  );
}
