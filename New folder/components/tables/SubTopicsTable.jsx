import React, { useState, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaGripVertical,
  FaEye,
  FaPowerOff,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const SubTopicsTable = ({
  subTopics,
  onEdit,
  onDelete,
  onDragEnd,
  onToggleStatus,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const router = useRouter();

  const handleSubTopicClick = (subTopicId) => {
    router.push(`/subtopic/${subTopicId}`);
  };

  if (!subTopics || subTopics.length === 0) {
    return (
      <div className="text-center py-16 bg-white/80 p-4 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
        <div className="text-gray-400 text-6xl mb-4">📑</div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
          No Sub Topics Found
        </h3>
        <p className="text-gray-600 text-xs">
          Create your first sub topic to get started.
        </p>
      </div>
    );
  }

  // Group subTopics by Exam → Subject → Unit → Chapter → Topic
  const groupedSubTopics = useMemo(() => {
    const groups = {};
    subTopics.forEach((subTopic) => {
      const examId = subTopic.examId?._id || subTopic.examId || "unassigned";
      const examName = subTopic.examId?.name || "Unassigned";
      const subjectId =
        subTopic.subjectId?._id || subTopic.subjectId || "unassigned";
      const subjectName = subTopic.subjectId?.name || "Unassigned";
      const unitId = subTopic.unitId?._id || subTopic.unitId || "unassigned";
      const unitName = subTopic.unitId?.name || "Unassigned";
      const chapterId =
        subTopic.chapterId?._id || subTopic.chapterId || "unassigned";
      const chapterName = subTopic.chapterId?.name || "Unassigned";
      const topicId = subTopic.topicId?._id || subTopic.topicId || "unassigned";
      const topicName = subTopic.topicId?.name || "Unassigned";
      const groupKey = `${examId}-${subjectId}-${unitId}-${chapterId}-${topicId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          examId,
          examName,
          subjectId,
          subjectName,
          unitId,
          unitName,
          chapterId,
          chapterName,
          topicId,
          topicName,
          subTopics: [],
        };
      }
      groups[groupKey].subTopics.push(subTopic);
    });

    // Sort by exam name, then subject name, then unit name, then chapter name, then topic name
    return Object.values(groups).sort((a, b) => {
      if (a.examName !== b.examName) {
        return a.examName.localeCompare(b.examName);
      }
      if (a.subjectName !== b.subjectName) {
        return a.subjectName.localeCompare(b.subjectName);
      }
      if (a.unitName !== b.unitName) {
        return a.unitName.localeCompare(b.unitName);
      }
      if (a.chapterName !== b.chapterName) {
        return a.chapterName.localeCompare(b.chapterName);
      }
      return a.topicName.localeCompare(b.topicName);
    });
  }, [subTopics]);

  const handleDragStart = (e, groupIndex, subTopicIndex) => {
    setDraggedIndex(`${groupIndex}-${subTopicIndex}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, groupIndex, subTopicIndex) => {
    e.preventDefault();
    const currentKey = `${groupIndex}-${subTopicIndex}`;
    if (!draggedIndex || draggedIndex === currentKey) return;

    const [sourceGroup, sourceIndex] = draggedIndex.split("-").map(Number);
    if (sourceGroup === groupIndex) {
      // Only allow drag within same group
      // Calculate new index in flat subTopics array
      let flatSourceIndex = 0;
      for (let i = 0; i < sourceGroup; i++) {
        flatSourceIndex += groupedSubTopics[i].subTopics.length;
      }
      flatSourceIndex += sourceIndex;

      let flatDestIndex = 0;
      for (let i = 0; i < groupIndex; i++) {
        flatDestIndex += groupedSubTopics[i].subTopics.length;
      }
      flatDestIndex += subTopicIndex;

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
      {groupedSubTopics.map((group, groupIndex) => {
        // Sort subTopics by orderNumber within each group
        const sortedSubTopics = [...group.subTopics].sort((a, b) => {
          const ao = a.orderNumber || Number.MAX_SAFE_INTEGER;
          const bo = b.orderNumber || Number.MAX_SAFE_INTEGER;
          return ao - bo;
        });

        return (
          <div
            key={`${group.examId}-${group.subjectId}-${group.unitId}-${group.chapterId}-${group.topicId}`}
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

                  {/* Chapter */}
                  <span className="px-3 py-1 bg-indigo-500 text-white rounded-full shadow-sm hover:bg-indigo-600 transition-all duration-200">
                    {group.chapterName}
                  </span>
                  <span className="text-gray-400 font-bold select-none">›</span>

                  {/* Topic */}
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full shadow-sm hover:bg-orange-600 transition-all duration-200">
                    {group.topicName}
                  </span>
                  <span className="text-gray-400 font-bold select-none">›</span>

                  {/* SubTopic Count */}
                  <span className="px-3 py-1 bg-gray-500 text-white rounded-full shadow-sm hover:bg-gray-600 transition-all duration-200">
                    {sortedSubTopics.length}{" "}
                    {sortedSubTopics.length === 1 ? "SubTopic" : "SubTopics"}
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
                    <th className="px-4 py-3 text-left">SubTopic Name</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedSubTopics.map((subTopic, subTopicIndex) => {
                    const dragKey = `${groupIndex}-${subTopicIndex}`;
                    return (
                      <tr
                        key={subTopic._id || subTopicIndex}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, groupIndex, subTopicIndex)
                        }
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, groupIndex, subTopicIndex)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`hover:bg-blue-50 transition-colors cursor-move ${
                          draggedIndex === dragKey ? "opacity-50" : ""
                        } ${
                          subTopic.status === "inactive"
                            ? "opacity-60 bg-gray-50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3  text-gray-400">
                          <FaGripVertical className="cursor-grab" />
                        </td>
                        {/* Order Number */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {subTopic.orderNumber || subTopicIndex + 1}
                          </span>
                        </td>
                        {/* SubTopic Name */}
                        <td className="px-4 py-3 font-medium text-base">
                          <span
                            onClick={() => handleSubTopicClick(subTopic._id)}
                            className={`cursor-pointer hover:text-blue-600 hover:underline transition-colors ${
                              subTopic.status === "inactive"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {subTopic.name}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {/* Action Buttons */}
                          <div className="flex justify-end gap-2">
                            {/* view subtopic details */}
                            <button
                              onClick={() => handleSubTopicClick(subTopic._id)}
                              className="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition"
                              title="View SubTopic Details"
                            >
                              <FaEye className="text-sm" />
                            </button>
                            {/* Edit SubTopic */}
                            <button
                              onClick={() => onEdit && onEdit(subTopic)}
                              className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition"
                              title="Edit SubTopic"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            {/* Delete SubTopic */}
                            <button
                              onClick={() => onDelete && onDelete(subTopic)}
                              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                              title="Delete SubTopic"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                            {/* Toggle Status SubTopic */}
                            <button
                              onClick={() =>
                                onToggleStatus && onToggleStatus(subTopic)
                              }
                              className="p-2 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition"
                              title={
                                subTopic.status === "active"
                                  ? "Deactivate SubTopic"
                                  : "Activate SubTopic"
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
              {sortedSubTopics.map((subTopic, subTopicIndex) => {
                const dragKey = `${groupIndex}-${subTopicIndex}`;
                return (
                  <div
                    key={subTopic._id || subTopicIndex}
                    className={`p-4 hover:bg-blue-50 transition-all duration-150 ${
                      subTopic.status === "inactive"
                        ? "opacity-60 bg-gray-50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleSubTopicClick(subTopic._id)}
                          className={`text-base font-semibold mb-1 cursor-pointer hover:text-blue-600 hover:underline transition-colors ${
                            subTopic.status === "inactive"
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {subTopic.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          #{subTopic.orderNumber || subTopicIndex + 1}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleSubTopicClick(subTopic._id)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          title="View SubTopic Details"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(subTopic)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(subTopic)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                        <button
                          onClick={() =>
                            onToggleStatus && onToggleStatus(subTopic)
                          }
                          className="p-2 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition"
                          title={
                            subTopic.status === "active"
                              ? "Deactivate SubTopic"
                              : "Activate SubTopic"
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

export default SubTopicsTable;
