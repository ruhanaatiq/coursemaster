// src/components/AssignmentAndQuizSection.jsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

axios.defaults.withCredentials = true;

export default function AssignmentAndQuizSection({ courseId, moduleId, batchId }) {
  const { user } = useSelector((state) => state.auth);

  // Assignment state
  const [answerText, setAnswerText] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(true);
  const [answers, setAnswers] = useState([]); // selected index per question
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Load quiz for this module
  useEffect(() => {
    if (!courseId || !moduleId) return;

    const fetchQuiz = async () => {
      try {
        setQuizLoading(true);
        setQuizError("");
        setQuiz(null);
        setQuizResult(null);

        const { data } = await axios.get(`${API_BASE}/api/quizzes`, {
          params: { courseId, moduleId },
          withCredentials: true,
        });

        setQuiz(data);
        setAnswers(Array(data.questions.length).fill(null));
      } catch (err) {
        console.error("Fetch quiz error:", err);
        // 404 is OK → may simply mean no quiz for this module
        if (err?.response?.status === 404) {
          setQuiz(null);
        } else {
          setQuizError(
            err?.response?.data?.message || "Failed to load quiz for this module."
          );
        }
      } finally {
        setQuizLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, moduleId]);

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setAssignmentMessage("");

    if (!answerText && !driveLink) {
      setAssignmentMessage("Please provide an answer or Drive link.");
      return;
    }

    try {
      setAssignmentLoading(true);

      await axios.post(
        `${API_BASE}/api/assignments`,
        {
          courseId,
          moduleId,
          batchId,
          answerText: answerText || undefined,
          driveLink: driveLink || undefined,
        },
        { withCredentials: true }
      );

      setAssignmentMessage("✅ Assignment submitted successfully!");
    } catch (err) {
      console.error("Assignment submit error:", err);
      setAssignmentMessage(
        err?.response?.data?.message || "Failed to submit assignment."
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleQuizOptionChange = (qIndex, optionIndex) => {
    const updated = [...answers];
    updated[qIndex] = optionIndex;
    setAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    if (answers.some((a) => a === null)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setQuizSubmitting(true);
      setQuizResult(null);
      setQuizError("");

      const { data } = await axios.post(
        `${API_BASE}/api/quizzes/submit`,
        {
          courseId,
          moduleId,
          answers,
        },
        { withCredentials: true }
      );

      // immediate result
      setQuizResult(data);
    } catch (err) {
      console.error("Quiz submit error:", err);
      setQuizError(
        err?.response?.data?.message || "Failed to submit quiz. Please try again."
      );
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-6 text-sm text-slate-500">
        Please log in to submit assignments and take quizzes.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {/* Assignment card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Assignment
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Submit your answer for this module. You can either paste a Google Drive
          link or write your answer directly.
        </p>

        <form onSubmit={handleSubmitAssignment} className="space-y-3">
          {/* Drive link */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Google Drive Link (optional)
            </label>
            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Text answer */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Text Answer (optional)
            </label>
            <textarea
              rows={4}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {assignmentMessage && (
            <p className="text-xs mt-1 text-slate-600">
              {assignmentMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={assignmentLoading}
            className="mt-2 inline-flex px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {assignmentLoading ? "Submitting..." : "Submit Assignment"}
          </button>
        </form>
      </div>

      {/* Quiz card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">
          Quiz
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Answer the multiple-choice questions below. Your score will appear
          immediately after submission.
        </p>

        {quizLoading && (
          <p className="text-sm text-slate-500">Loading quiz…</p>
        )}

        {!quizLoading && !quiz && !quizError && (
          <p className="text-sm text-slate-500">
            There is no quiz available for this module yet.
          </p>
        )}

        {quizError && (
          <p className="mb-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1">
            {quizError}
          </p>
        )}

        {quiz && (
          <div className="space-y-4">
            {quiz.questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border border-slate-100 rounded-lg p-3"
              >
                <p className="text-sm font-medium text-slate-900 mb-2">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        value={optIndex}
                        checked={answers[qIndex] === optIndex}
                        onChange={() =>
                          handleQuizOptionChange(qIndex, optIndex)
                        }
                        className="h-3 w-3"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              disabled={quizSubmitting}
              onClick={handleSubmitQuiz}
              className="inline-flex px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {quizSubmitting ? "Submitting..." : "Submit Quiz"}
            </button>

            {quizResult && (
              <div className="mt-3 text-sm">
                <p className="font-medium text-slate-900">
                  ✅ Your Score: {quizResult.score}%
                </p>
                <p className="text-xs text-slate-600">
                  Correct: {quizResult.correct} / {quizResult.total}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
