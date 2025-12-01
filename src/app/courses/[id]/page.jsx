// src/app/courses/[id]/page.jsx

import EnrollButton from "./EnrollButton";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default async function CourseDetailsPage({ params }) {
  const { id } = params;

  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-500">Failed to load course details.</p>
      </div>
    );
  }

  const data = await res.json();
  const course = data.course;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Left: Course Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">
            {course.category || "General"}
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {course.title}
          </h1>

          <p className="text-sm text-slate-500 mb-4">
            by{" "}
            <span className="font-medium">
              {course.instructor || "Unknown Instructor"}
            </span>
          </p>

          <p className="text-sm text-slate-700 leading-relaxed mb-6">
            {course.description}
          </p>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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

          {/* Syllabus */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Syllabus
            </h2>
            {course.syllabus && course.syllabus.length > 0 ? (
              <ol className="space-y-2 text-sm text-slate-700">
                {course.syllabus
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((lesson, idx) => (
                    <li
                      key={lesson._id || idx}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-0.5 text-[11px] w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-xs text-slate-500">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">
                Syllabus will be available soon.
              </p>
            )}
          </div>
        </div>

        {/* Right: Sidebar (Price + Enroll) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit">
          <p className="text-sm text-slate-500 mb-1">Course Price</p>
          <p className="text-3xl font-bold text-slate-900 mb-4">
            {course.price && course.price > 0 ? (
              <>${course.price}</>
            ) : (
              <span className="text-green-600 text-2xl">Free</span>
            )}
          </p>

          <EnrollButton courseId={course._id} />

          <p className="mt-4 text-xs text-slate-500">
            Once enrolled, you&apos;ll get access to video lectures, syllabus
            content, assignments, and quizzes.
          </p>
        </div>
      </div>
    </div>
  );
}
