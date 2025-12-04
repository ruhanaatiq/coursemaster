"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full pt-28 pb-20 bg-white relative overflow-hidden">
      {/* Background gradient blob */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-300/30 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight"
          >
            Learn New Skills.  
            <span className="text-blue-600"> Upgrade Your Future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-slate-600 text-base md:text-lg max-w-md"
          >
            Master trending technologies with expert-led courses, interactive
            modules, and real-world projects — all in one place.
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-6 flex gap-4"
          >
            <Link
              href="/courses"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Explore Courses
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
            >
              Start Learning
            </Link>
          </motion.div>

          {/* SOCIAL PROOF */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex items-center gap-6 text-sm text-slate-600"
          >
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-lg">⭐</span> 4.9/5 Rating
            </div>
            <div className="flex items-center gap-2">
              👨‍🎓 500+ Students
            </div>
          </motion.div>
        </div>

        {/* RIGHT GRAPHIC (subtle floating animation) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center"
        >
          <motion.img
            src="https://cdni.iconscout.com/illustration/premium/thumb/online-courses-6818594-5638799.png"
            alt="Learning Illustration"
            className="w-[85%] md:w-[80%] drop-shadow-xl"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
