"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../layout/MainLayout";
import { FaBook, FaGraduationCap } from "react-icons/fa";
import ListItem from "../components/ListItem";
import {
  fetchExamById,
  fetchSubjectsByExam,
  createSlug,
  findByIdOrSlug,
} from "../lib/api";

const TABS = ["Overview", "Discussion Forum", "Practice Test", "Performance"];

const ExamPage = () => {
  const { exam: examId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Data states
  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exam and subjects
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch exam
        const fetchedExam = await fetchExamById(examId);
        if (!fetchedExam) {
          notFound();
          return;
        }
        setExam(fetchedExam);

        // Fetch subjects for this exam
        const examIdValue = fetchedExam._id || examId;
        const fetchedSubjects = await fetchSubjectsByExam(examIdValue);
        // Subjects are already sorted by orderNumber in the API function
        setSubjects(fetchedSubjects);
      } catch (err) {
        console.error("Error loading exam data:", err);
        setError("Failed to load exam data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (examId) {
      loadData();
    }
  }, [examId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !exam) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || "Exam not found"}
          </div>
        </div>
      </MainLayout>
    );
  }

  const examSlug = exam ? createSlug(exam.name) : "";

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <section className="bg-gradient-to-b from-purple-50/40 via-white to-purple-50/30 border border-purple-100 rounded-xl p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">
                {exam.name} Exam Preparation
              </h1>
              <p className="text-sm text-gray-600">
                Prepare with expert guidance and resources for your {exam.name}{" "}
                exam.
              </p>
            </div>

            {/* Progress */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">My Preparation</p>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">0%</span>
                <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-white rounded-xl shadow-md border border-gray-100">
          <nav className="flex justify-around border-b border-gray-200 bg-gray-50">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          <div className="p-6 text-gray-600">
            {activeTab === "Overview" && (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: exam?.content || "No content available.",
                }}
              />
            )}
            {activeTab === "Discussion Forum" && (
              <div>Discussion Forum content will appear here...</div>
            )}
            {activeTab === "Practice Test" && (
              <div>Practice Test content will appear here...</div>
            )}
            {activeTab === "Performance" && (
              <div>Performance content will appear here...</div>
            )}
          </div>
        </section>

        {/* Subjects Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FaGraduationCap className="text-xl text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {exam.name} Subjects
            </h2>
          </div>

          <div className="space-y-3">
            {subjects.length > 0 ? (
              subjects.map((subject, index) => {
                const subjectSlug = createSlug(subject.name);
                return (
                  <ListItem
                    key={subject._id}
                    item={{
                      name: subject.name,
                      weightage: subject.weightage || "20%",
                      engagement: subject.engagement || "2.2K",
                      isCompleted: subject.isCompleted || false,
                      progress: subject.progress || 0,
                    }}
                    index={index}
                    href={`/${examSlug}/${subjectSlug}`}
                  />
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No subjects available for this exam.
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ExamPage;
