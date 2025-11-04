import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaEye, FaPowerOff } from "react-icons/fa";

const SubjectTable = ({ subjects, onEdit, onDelete, onToggleStatus }) => {
  const router = useRouter();

  const handleSubjectClick = (subject) => {
    router.push(`/subjects/${subject._id}`);
  };

  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="text-gray-400 text-6xl mb-4">📘</div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
          No Subjects Found
        </h3>
        <p className="text-gray-500 text-xs">
          Add your first subject to get started.
        </p>
      </div>
    );
  }

  // Group subjects by Exam
  const groupedSubjects = useMemo(() => {
    const groups = {};
    subjects.forEach((subject) => {
      const examId = subject.examId?._id || subject.examId || "unassigned";
      const examName = subject.examId?.name || "Unassigned";
      if (!groups[examId]) {
        groups[examId] = {
          examId,
          examName,
          subjects: [],
        };
      }
      groups[examId].subjects.push(subject);
    });

    // Sort groups alphabetically by exam name
    return Object.values(groups).sort((a, b) =>
      a.examName.localeCompare(b.examName)
    );
  }, [subjects]);

  return (
    <div className="space-y-6">
      {groupedSubjects.map((group, groupIndex) => (
        <div
          key={group.examId}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn"
          style={{ animationDelay: `${groupIndex * 0.1}s` }}
        >
          {/* 💎 Refined Compact Breadcrumb Header */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-3 rounded-lg border border-indigo-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-gray-700">
                {/* Exam Name */}
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm hover:shadow-md hover:bg-blue-700 transition-all duration-200">
                  {group.examName}
                </span>

                <span className="text-gray-400 font-bold select-none">›</span>

                {/* Subject Count */}
                <span className="px-3 py-1 rounded-full bg-indigo-500 text-white shadow-sm hover:shadow-md hover:bg-indigo-600 transition-all duration-200">
                  {group.subjects.length}{" "}
                  {group.subjects.length === 1 ? "Subject" : "Subjects"}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Subject Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {group.subjects.map((subject, index) => (
                  <tr
                    key={subject._id || subject.id || index}
                    className={`hover:bg-blue-50 transition-colors ${
                      subject.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                    }`}
                  >
                    <td
                      className={`px-4 py-3 font-medium text-base cursor-pointer hover:text-blue-600 transition-colors ${
                        subject.status === "inactive"
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                      onClick={() => handleSubjectClick(subject)}
                    >
                      {subject.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleSubjectClick(subject)}
                          className="text-green-600 hover:text-green-800 p-1.5 rounded-full hover:bg-green-100 transition-all"
                          title="View Subject Details"
                        >
                          <FaEye className="text-base" />
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(subject)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-100 transition-all"
                          title="Edit Subject"
                        >
                          <FaEdit className="text-base" />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(subject)}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-100 transition-all"
                          title="Delete Subject"
                        >
                          <FaTrash className="text-base" />
                        </button>
                        <button
                          onClick={() =>
                            onToggleStatus && onToggleStatus(subject)
                          }
                          className="text-orange-600 hover:text-orange-800 p-1.5 rounded-full hover:bg-orange-100 transition-all"
                          title={
                            subject.status === "active"
                              ? "Deactivate Subject"
                              : "Activate Subject"
                          }
                        >
                          <FaPowerOff className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tablet/Mobile View */}
          <div className="lg:hidden divide-y divide-gray-100">
            {group.subjects.map((subject, index) => (
              <div
                key={subject._id || subject.id || index}
                className={`p-4 hover:bg-blue-50 transition-all duration-150 ${
                  subject.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 min-w-0 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSubjectClick(subject)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        subject.status === "inactive" ? "bg-red-500" : "bg-green-500"
                      }`}></div>
                      <h3 className={`text-sm font-medium truncate ${
                        subject.status === "inactive" ? "text-gray-500 line-through" : "text-gray-900"
                      }`}>
                        {subject.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleSubjectClick(subject)}
                      className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-all"
                      title="View Subject Details"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(subject)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-all"
                      title="Edit Subject"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(subject)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-all"
                      title="Delete Subject"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(subject)}
                      className="text-orange-600 hover:text-orange-700 p-2 rounded-md hover:bg-orange-50 transition-all"
                      title={
                        subject.status === "active"
                          ? "Deactivate Subject"
                          : "Activate Subject"
                      }
                    >
                      <FaPowerOff className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectTable;
