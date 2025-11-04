import React, { useState, useMemo } from "react";
import {
  FaEdit,
  FaTrash,
  FaGripVertical,
  FaEye,
  FaPowerOff,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const TopicsTable = ({
  topics,
  onEdit,
  onDelete,
  onDragEnd,
  onToggleStatus,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const router = useRouter();

  const handleTopicClick = (topicId) => {
    router.push(`/admin/topic/${topicId}`);
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Topics Found
        </h3>
        <p className="text-gray-500">Create your first topic to get started.</p>
      </div>
    );
  }

  // Group topics by Exam → Subject → Unit → Chapter
  const groupedTopics = useMemo(() => {
    const groups = {};
    topics.forEach((topic) => {
      const examId = topic.examId?._id || topic.examId || "unassigned";
      const examName = topic.examId?.name || "Unassigned";
      const subjectId = topic.subjectId?._id || topic.subjectId || "unassigned";
      const subjectName = topic.subjectId?.name || "Unassigned";
      const unitId = topic.unitId?._id || topic.unitId || "unassigned";
      const unitName = topic.unitId?.name || "Unassigned";
      const chapterId = topic.chapterId?._id || topic.chapterId || "unassigned";
      const chapterName = topic.chapterId?.name || "Unassigned";
      const groupKey = `${examId}-${subjectId}-${unitId}-${chapterId}`;

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
          topics: [],
        };
      }
      groups[groupKey].topics.push(topic);
    });

    // Sort by exam name, then subject name, then unit name, then chapter name
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
      return a.chapterName.localeCompare(b.chapterName);
    });
  }, [topics]);

  const handleDragStart = (e, groupIndex, topicIndex) => {
    setDraggedIndex(`${groupIndex}-${topicIndex}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, groupIndex, topicIndex) => {
    e.preventDefault();
    const currentKey = `${groupIndex}-${topicIndex}`;
    if (!draggedIndex || draggedIndex === currentKey) return;

    const [sourceGroup, sourceIndex] = draggedIndex.split("-").map(Number);
    if (sourceGroup === groupIndex) {
      // Only allow drag within same group
      // Calculate new index in flat topics array
      let flatSourceIndex = 0;
      for (let i = 0; i < sourceGroup; i++) {
        flatSourceIndex += groupedTopics[i].topics.length;
      }
      flatSourceIndex += sourceIndex;

      let flatDestIndex = 0;
      for (let i = 0; i < groupIndex; i++) {
        flatDestIndex += groupedTopics[i].topics.length;
      }
      flatDestIndex += topicIndex;

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
      {groupedTopics.map((group, groupIndex) => {
        // Sort topics by orderNumber within each group
        const sortedTopics = [...group.topics].sort((a, b) => {
          const ao = a.orderNumber || Number.MAX_SAFE_INTEGER;
          const bo = b.orderNumber || Number.MAX_SAFE_INTEGER;
          return ao - bo;
        });

        return (
          <div
            key={`${group.examId}-${group.subjectId}-${group.unitId}-${group.chapterId}`}
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

                  {/* Topics */}
                  <span className="px-3 py-1 bg-gray-500 text-white rounded-full shadow-sm hover:bg-gray-600 transition-all duration-200">
                    {sortedTopics.length}{" "}
                    {sortedTopics.length === 1 ? "Topic" : "Topics"}
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
                    <th className="px-4 py-3 text-left">Topic Name</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedTopics.map((topic, topicIndex) => {
                    const dragKey = `${groupIndex}-${topicIndex}`;
                    return (
                      <tr
                        key={topic._id || topicIndex}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, groupIndex, topicIndex)
                        }
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, groupIndex, topicIndex)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`hover:bg-blue-50 transition-colors cursor-move ${
                          draggedIndex === dragKey ? "opacity-50" : ""
                        } ${
                          topic.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400">
                          <FaGripVertical className="cursor-grab" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {topic.orderNumber || topicIndex + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-base">
                          <span
                            onClick={() => handleTopicClick(topic._id)}
                            className={`cursor-pointer hover:text-blue-600 hover:underline transition-colors ${
                              topic.status === "inactive"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {topic.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleTopicClick(topic._id)}
                              className="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition"
                              title="View Topic Details"
                            >
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => onEdit && onEdit(topic)}
                              className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition"
                              title="Edit Topic"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => onDelete && onDelete(topic)}
                              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                              title="Delete Topic"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                            <button
                              onClick={() =>
                                onToggleStatus && onToggleStatus(topic)
                              }
                              className="p-2 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition"
                              title={
                                topic.status === "active"
                                  ? "Deactivate Topic"
                                  : "Activate Topic"
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
              {sortedTopics.map((topic, topicIndex) => {
                const dragKey = `${groupIndex}-${topicIndex}`;
                return (
                  <div
                    key={topic._id || topicIndex}
                    className={`p-4 hover:bg-blue-50 transition-all duration-150 ${
                      topic.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleTopicClick(topic._id)}
                          className={`text-base font-semibold mb-1 cursor-pointer hover:text-blue-600 hover:underline transition-colors ${
                            topic.status === "inactive"
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {topic.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          #{topic.orderNumber || topicIndex + 1}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleTopicClick(topic._id)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          title="View Topic Details"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(topic)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(topic)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                        <button
                          onClick={() =>
                            onToggleStatus && onToggleStatus(topic)
                          }
                          className="p-2 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition"
                          title={
                            topic.status === "active"
                              ? "Deactivate Topic"
                              : "Activate Topic"
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

export default TopicsTable;

