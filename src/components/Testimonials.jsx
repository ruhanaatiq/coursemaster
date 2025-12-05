"use client";

import { FaStar } from "react-icons/fa";
import Image from "next/image";
const testimonials = [
  {
    name: "Aisha Rahman",
    role: "Frontend Developer",
    image: "https://i.pravatar.cc/150?img=47",
    rating: 5,
    text: "CourseMaster helped me learn React properly. The lessons, structure, and hands-on tasks were exactly what I needed to land my first internship!",
  },
  {
    name: "Farhan Chowdhury",
    role: "CSE Student",
    image: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "The explanations are clear and beginner-friendly. I love how progress tracking keeps me motivated throughout the course.",
  },
  {
    name: "Nishat Jahan",
    role: "Junior MERN Developer",
    image: "https://i.pravatar.cc/150?img=32",
    rating: 4,
    text: "The admin dashboard and course management tools are amazingly intuitive. Great platform for both learning and teaching!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 text-center mb-4">
          What Our Learners Say
        </h2>
        <p className="text-slate-500 text-center max-w-xl mx-auto mb-12">
          Join thousands of students learning modern web development through structured lessons and real projects.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="bg-slate-50 border border-slate-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                “{t.text}”
              </p>

              <div className="flex gap-1 text-yellow-400 text-sm">
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
