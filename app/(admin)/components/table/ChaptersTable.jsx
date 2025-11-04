"use client";
import React, { useState, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaGripVertical,
  FaEye,
  FaPowerOff,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const ChaptersTable = ({
  chapters,
  onEdit,
  onDelete,
  onDragEnd,
  onToggleStatus,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const router = useRouter();

  const handleChapterClick = (chapterId) => {
    router.push(`/admin/chapter/${chapterId}`);
  };

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-md">
        <div className="text-6xl mb-4">📘</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Chapters Found
        </h3>
        <p className="text-gray-500 text-sm">
          Add your first chapter to get started.
        </p>
      </div>
    );
  }

  // Group chapters by Exam → Subject → Unit
  const groupedChapters = useMemo(() => {
    const groups = {};
    chapters.forEach((chapter) => {
      const examId = chapter.examId?._id || chapter.examId || "unassigned";
      const examName = chapter.examId?.name || "Unassigned";
      const subjectId =
        chapter.subjectId?._id || chapter.subjectId || "unassigned";
      const subjectName = chapter.subjectId?.name || "Unassigned";
      const unitId = chapter.unitId?._id || chapter.unitId || "unassigned";
      const unitName = chapter.unitId?.name || "Unassigned";
      const groupKey = `${examId}-${subjectId}-${unitId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          examId,
          examName,
          subjectId,
          subjectName,
          unitId,
          unitName,
          chapters: [],
        };
      }
      groups[groupKey].chapters.push(chapter);
    });

    // Sort by exam name, then subject name, then unit name
    return Object.values(groups).sort((a, b) => {
      if (a.examName !== b.examName) {
        return a.examName.localeCompare(b.examName);
      }
      if (a.subjectName !== b.subjectName) {
        return a.subjectName.localeCompare(b.subjectName);
      }
      return a.unitName.localeCompare(b.unitName);
    });
  }, [chapters]);

  const handleDragStart = (e, groupIndex, chapterIndex) => {
    setDraggedIndex(`${groupIndex}-${chapterIndex}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, groupIndex, chapterIndex) => {
    e.preventDefault();
    const currentKey = `${groupIndex}-${chapterIndex}`;
    if (!draggedIndex || draggedIndex === currentKey) return;

    const [sourceGroup, sourceIndex] = draggedIndex.split("-").map(Number);
    if (sourceGroup === groupIndex) {
      // Only allow drag within same group
      // Calculate new index in flat chapters array
      let flatSourceIndex = 0;
      for (let i = 0; i < sourceGroup; i++) {
        flatSourceIndex += groupedChapters[i].chapters.length;
      }
      flatSourceIndex += sourceIndex;

      let flatDestIndex = 0;
      for (let i = 0; i < groupIndex; i++) {
        flatDestIndex += groupedChapters[i].chapters.length;
      }
      flatDestIndex += chapterIndex;

      onDragEnd &&
        onDragEnd({
          source: { index: flatSourceIndex },
          destination: { index: flatDestIndex },
        });
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6">
      {groupedChapters.map((group, groupIndex) => {
        // Sort chapters by orderNumber within each group
        const sortedChapters = [...group.chapters].sort((a, b) => {
          const ao = a.orderNumber || Number.MAX_SAFE_INTEGER;
          const bo = b.orderNumber || Number.MAX_SAFE_INTEGER;
          return ao - bo;
        });

        return (
          <div
            key={`${group.examId}-${group.subjectId}-${group.unitId}`}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn"
            style={{ animationDelay: `${groupIndex * 0.1}s` }}
          >
            {/* 💎 Consistent Compact Breadcrumb Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-3 rounded-t-xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-gray-700">
                  {/* Exam */}
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full shadow-sm hover:bg-green-600 transition-all duration-200">
                    {group.examName}
                  </span>
                  <span className="text-gray-400 font-bold select-none">›</span>

                  {/* Subject */}
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full shadow-sm hover:bg-purple-600 transition-all duration-200">
                    {group.subjectName}
                  </span>
                  <span className="text-gray-400 font-bold select-none">›</span>

                  {/* Unit */}
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-all duration-200">
                    {group.unitName}
                  </span>
                  <span className="text-gray-400 font-bold select-none">›</span>

                  {/* Chapters */}
                  <span className="px-3 py-1 bg-gray-500 text-white rounded-full shadow-sm hover:bg-gray-600 transition-all duration-200">
                    {sortedChapters.length}{" "}
                    {sortedChapters.length === 1 ? "Chapter" : "Chapters"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Chapter Name</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedChapters.map((chapter, chapterIndex) => {
                    const dragKey = `${groupIndex}-${chapterIndex}`;
                    return (
                      <tr
                        key={chapter._id || chapterIndex}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, groupIndex, chapterIndex)
                        }
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, groupIndex, chapterIndex)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`hover:bg-blue-50 transition-colors cursor-move ${
                          draggedIndex === dragKey ? "opacity-50" : ""
                        } ${
                          chapter.status === "inactive"
                            ? "opacity-60 bg-gray-50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400">
                          <FaGripVertical className="cursor-grab" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {chapter.orderNumber || chapterIndex + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-base">
                          <span
                            onClick={() => handleChapterClick(chapter._id)}
                            className={`cursor-pointer hover:text-blue-600 hover:underline transition-colors ${
                              chapter.status === "inactive"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {chapter.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleChapterClick(chapter._id)}
                              className="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition"
                              title="View Chapter Details"
                            >
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => onEdit?.(chapter)}
                              className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition"
                              title="Edit Chapter"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => onDelete?.(chapter)}
                              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                              title="Delete Chapter"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                            <button
                              onClick={() => onToggleStatus?.(chapter)}
                              className="p-2 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition"
                              title={
                                chapter.status === "active"
                                  ? "Deactivate Chapter"
                                  : "Activate Chapter"
                              }
                            >
                              <FaPowerOff className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden divide-y divide-gray-100">
              {sortedChapters.map((chapter, chapterIndex) => {
                const dragKey = `${groupIndex}-${chapterIndex}`;
                return (
                  <div
                    key={chapter._id || chapterIndex}
                    className={`p-4 hover:bg-blue-50 transition-all duration-150 ${
                      chapter.status === "inactive"
                        ? "opacity-60 bg-gray-50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleChapterClick(chapter._id)}
                          className={`text-base font-semibold mb-1 cursor-pointer hover:text-blue-600 hover:underline transition-colors ${
                            chapter.status === "inactive"
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {chapter.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          #{chapter.orderNumber || chapterIndex + 1}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleChapterClick(chapter._id)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          title="View Chapter Details"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => onEdit?.(chapter)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete?.(chapter)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                        <button
                          onClick={() => onToggleStatus?.(chapter)}
                          className="p-2 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition"
                          title={
                            chapter.status === "active"
                              ? "Deactivate Chapter"
                              : "Activate Chapter"
                          }
                        >
                          <FaPowerOff className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChaptersTable;
