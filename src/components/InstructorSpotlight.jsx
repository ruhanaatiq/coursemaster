"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const instructors = [
  {
    name: "Dr.Hossain",
    role: "Cybersecurity Instructor",
    specialty: "Cybersecurity & Ethical Hacking",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    coursesLabel: "Cybersecurity Courses",
  },
  {
    name: "Dr.Charles",
    role: "Senior Programming Instructor",
    specialty: "Python for Everybody",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    coursesLabel: "Python & Programming",
  },
  {
    name: "Elford Coon",
    role: "UI/UX Instructor",
    specialty: "UI UX for beginners",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    coursesLabel: "Design & UI/UX",
  },
];

export default function InstructorSpotlight() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Meet Our Expert Instructors
          </h2>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto">
            Learn directly from industry professionals who teach the same
            skills they use in real projects.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {instructors.map((ins, index) => (
            <motion.div
              key={ins.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition"
            >
              {/* Instructor Image */}
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden shadow mb-4">
                <img
                  src={ins.image}
                  alt={ins.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-slate-900">
                {ins.name}
              </h3>

              {/* Role */}
              <p className="text-sm text-slate-500 mt-1">{ins.role}</p>

              {/* Specialty */}
              <p className="text-sm mt-2 text-blue-600 font-medium">
                {ins.specialty}
              </p>

              {/* Courses label */}
              <p className="mt-3 text-xs text-slate-600">
                {ins.coursesLabel}
              </p>

              {/* 🔗 View instructor's courses */}
              <Link
                href={`/courses?instructor=${encodeURIComponent(ins.name)}`}
                className="mt-4 inline-block px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm hover:bg-blue-50 transition"
              >
                View Courses
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
