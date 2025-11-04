"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaCalendar, FaChevronDown, FaChevronUp } from "react-icons/fa";
import {
  fetchExams,
  fetchExamById,
  fetchSubjectsByExam,
  fetchUnitsBySubject,
  fetchChaptersByUnit,
  fetchTopicsByChapter,
  createSlug,
  findByIdOrSlug,
} from "../lib/api";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [subjectsWithData, setSubjectsWithData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Extract exam from pathname
  const pathSegments = pathname.toLowerCase().split("/").filter(Boolean);
  const currentExamSlug = pathSegments[0];
  const [subjectKey, unitKey, chapterKey, topicKey] = pathSegments.slice(1);

  // Fetch exams on mount
  useEffect(() => {
    const loadExams = async () => {
      try {
        const fetchedExams = await fetchExams();
        setExams(fetchedExams);

        // Find current exam from pathname
        if (currentExamSlug) {
          const foundExam = findByIdOrSlug(fetchedExams, currentExamSlug);
          if (foundExam) {
            setSelectedExam(foundExam);
            await loadExamData(foundExam);
          }
        }
      } catch (error) {
        console.error("Error loading exams:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExams();
  }, []);

  // Load exam data (subjects, units, chapters, topics)
  const loadExamData = async (exam) => {
    try {
      const examIdValue = exam._id;

      // Fetch subjects
      const fetchedSubjects = await fetchSubjectsByExam(examIdValue);
      const subjectsMap = {};
      const subjectsData = {};

      for (const subject of fetchedSubjects) {
        const subjectSlug = createSlug(subject.name);
        subjectsMap[subjectSlug] = subject;

        // Fetch units for this subject
        const units = await fetchUnitsBySubject(subject._id, examIdValue);
        const unitsData = {};

        for (const unit of units) {
          const unitSlug = createSlug(unit.name);

          // Fetch chapters for this unit
          const chapters = await fetchChaptersByUnit(unit._id);
          const chaptersData = {};

          for (const chapter of chapters) {
            const chapterSlug = createSlug(chapter.name);

            // Fetch topics for this chapter
            const topics = await fetchTopicsByChapter(chapter._id);
            chaptersData[chapterSlug] = {
              name: chapter.name,
              topics: topics.map((t) => ({
                name: t.name,
                slug: createSlug(t.name),
              })),
            };
          }

          unitsData[unitSlug] = {
            name: unit.name,
            chapters: chaptersData,
          };
        }

        subjectsData[subjectSlug] = {
          name: subject.name,
          units: unitsData,
        };
      }

      setSubjects(subjectsMap);
      setSubjectsWithData(subjectsData);
    } catch (error) {
      console.error("Error loading exam data:", error);
    }
  };

  // Update exam data when exam changes
  useEffect(() => {
    if (selectedExam) {
      loadExamData(selectedExam);
    }
  }, [selectedExam]);

  // Update selected exam when pathname changes
  useEffect(() => {
    if (currentExamSlug && exams.length > 0) {
      const foundExam = findByIdOrSlug(exams, currentExamSlug);
      if (foundExam && foundExam._id !== selectedExam?._id) {
        setSelectedExam(foundExam);
      }
    }
  }, [currentExamSlug, exams]);

  // Initial expansion state - only expand if keys exist
  const [expandedSubjects, setExpandedSubjects] = useState(
    subjectKey ? { [subjectKey]: true } : {}
  );
  const [expandedUnits, setExpandedUnits] = useState(
    unitKey ? { [unitKey]: true } : {}
  );
  const [expandedChapters, setExpandedChapters] = useState(
    chapterKey ? { [chapterKey]: true } : {}
  );

  // Handlers
  const toggle = (setFn, key) =>
    setFn((prev) => ({ ...prev, [key]: !prev[key] }));

  const goTo = (path) => router.push(path);

  // Click outside to close dropdown
  useEffect(() => {
    if (!examDropdownOpen) return;
    const close = (e) =>
      !dropdownRef.current?.contains(e.target) && setExamDropdownOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [examDropdownOpen]);

  const handleExamChange = async (exam) => {
    setExamDropdownOpen(false);
    setSelectedExam(exam);
    const examSlug = createSlug(exam.name);
    goTo(`/${examSlug}`);
  };

  if (isLoading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block overflow-y-auto shadow-sm">
        <div className="p-4 space-y-5">
          <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block overflow-y-auto shadow-sm">
      <div className="p-4 space-y-5">
        {/* Exam Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setExamDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <FaCalendar className="text-indigo-600 text-sm" />
              <span className="text-sm font-medium text-gray-800">
                {selectedExam?.name || "Select Exam"}
              </span>
            </div>
            <FaChevronDown
              className={`text-indigo-600 text-xs transition-transform ${
                examDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {examDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-md z-40 overflow-hidden">
              {exams.map((exam) => (
                <button
                  key={exam._id}
                  onClick={() => handleExamChange(exam)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${
                    selectedExam?._id === exam._id
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {exam.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subjects */}
        {selectedExam && Object.keys(subjectsWithData).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(subjectsWithData).map(([subKey, sub]) => {
              const isSubjectActive =
                subjectKey && subjectKey === subKey.toLowerCase();
              const isExpanded = expandedSubjects[subKey] ?? false;

              return (
                <div key={subKey}>
                  {/* Subject */}
                  <div
                    className={`flex items-center justify-between rounded-md transition-colors ${
                      isSubjectActive ? "bg-cyan-50" : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        const examSlug = createSlug(selectedExam.name);
                        goTo(`/${examSlug}/${subKey}`);
                        setExpandedSubjects((p) => ({ ...p, [subKey]: true }));
                      }}
                      className={`flex-1 text-left px-3 py-2 text-sm font-semibold uppercase rounded-md ${
                        isSubjectActive
                          ? "text-cyan-700 border-l-4 border-cyan-500 bg-cyan-50"
                          : "hover:bg-gray-50 text-cyan-700"
                      }`}
                    >
                      {sub.name}
                    </button>
                    <button
                      onClick={() => toggle(setExpandedSubjects, subKey)}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      {isExpanded ? (
                        <FaChevronUp className="text-xs text-gray-500" />
                      ) : (
                        <FaChevronDown className="text-xs text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Units */}
                  {isExpanded && Object.keys(sub.units || {}).length > 0 && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-2">
                      {Object.entries(sub.units || {}).map(
                        ([unitKeySlug, unit]) => {
                          const isUnitActive =
                            unitKey && unitKey === unitKeySlug;
                          const unitExpanded =
                            expandedUnits[unitKeySlug] ?? false;

                          return (
                            <div key={unitKeySlug}>
                              <div className="flex items-center justify-between">
                                <button
                                  onClick={() => {
                                    const examSlug = createSlug(
                                      selectedExam.name
                                    );
                                    goTo(
                                      `/${examSlug}/${subKey}/${unitKeySlug}`
                                    );
                                    setExpandedUnits((p) => ({
                                      ...p,
                                      [unitKeySlug]: true,
                                    }));
                                  }}
                                  className={`flex-1 text-left px-2 py-1.5 rounded text-xs font-semibold ${
                                    isUnitActive
                                      ? "bg-purple-50 text-purple-700 border-l-4 border-purple-500"
                                      : "hover:bg-gray-50 text-purple-700"
                                  }`}
                                >
                                  {unit.name}
                                </button>
                                {Object.keys(unit.chapters || {}).length >
                                  0 && (
                                  <button
                                    onClick={() =>
                                      toggle(setExpandedUnits, unitKeySlug)
                                    }
                                    className="p-1 hover:bg-gray-100 rounded-md"
                                  >
                                    {unitExpanded ? (
                                      <FaChevronUp className="text-xs text-gray-400" />
                                    ) : (
                                      <FaChevronDown className="text-xs text-gray-400" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Chapters */}
                              {unitExpanded &&
                                Object.keys(unit.chapters || {}).length > 0 && (
                                  <div className="ml-3 mt-1 space-y-1 border-l border-gray-100 pl-2">
                                    {Object.entries(unit.chapters || {}).map(
                                      ([chapterKeySlug, chapter]) => {
                                        const isChapterActive =
                                          chapterKey &&
                                          chapterKey === chapterKeySlug;
                                        const chapterExpanded =
                                          expandedChapters[chapterKeySlug] ??
                                          false;

                                        return (
                                          <div key={chapterKeySlug}>
                                            <div className="flex items-center justify-between">
                                              <button
                                                onClick={() => {
                                                  const examSlug = createSlug(
                                                    selectedExam.name
                                                  );
                                                  goTo(
                                                    `/${examSlug}/${subKey}/${unitKeySlug}/${chapterKeySlug}`
                                                  );
                                                  setExpandedChapters((p) => ({
                                                    ...p,
                                                    [chapterKeySlug]: true,
                                                  }));
                                                }}
                                                className={`flex-1 text-left px-2 py-1.5 rounded text-xs font-semibold ${
                                                  isChapterActive
                                                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
                                                    : "hover:bg-gray-50 text-indigo-700"
                                                }`}
                                              >
                                                {chapter.name}
                                              </button>
                                              {chapter.topics?.length > 0 && (
                                                <button
                                                  onClick={() =>
                                                    toggle(
                                                      setExpandedChapters,
                                                      chapterKeySlug
                                                    )
                                                  }
                                                  className="p-1 hover:bg-gray-100 rounded-md"
                                                >
                                                  {chapterExpanded ? (
                                                    <FaChevronUp className="text-xs text-gray-400" />
                                                  ) : (
                                                    <FaChevronDown className="text-xs text-gray-400" />
                                                  )}
                                                </button>
                                              )}
                                            </div>

                                            {/* Topics */}
                                            {chapterExpanded &&
                                              chapter.topics?.length > 0 && (
                                                <div className="ml-3 mt-1 space-y-1">
                                                  {chapter.topics.map(
                                                    (topic) => {
                                                      const isTopicActive =
                                                        topicKey &&
                                                        topicKey === topic.slug;
                                                      const examSlug =
                                                        createSlug(
                                                          selectedExam.name
                                                        );
                                                      return (
                                                        <button
                                                          key={topic.slug}
                                                          onClick={() =>
                                                            goTo(
                                                              `/${examSlug}/${subKey}/${unitKeySlug}/${chapterKeySlug}/${encodeURIComponent(
                                                                topic.slug
                                                              )}`
                                                            )
                                                          }
                                                          className={`w-full text-left px-3 py-1.5 text-xs rounded-md flex items-center ${
                                                            isTopicActive
                                                              ? "bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500"
                                                              : "hover:bg-gray-50 text-gray-700"
                                                          }`}
                                                        >
                                                          {isTopicActive && (
                                                            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2" />
                                                          )}
                                                          {topic.name}
                                                        </button>
                                                      );
                                                    }
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : selectedExam ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No subjects available
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            Select an exam
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
