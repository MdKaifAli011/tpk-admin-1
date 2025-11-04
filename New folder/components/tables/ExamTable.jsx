"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaClipboardList,
  FaPowerOff,
} from "react-icons/fa";

const ExamTable = ({ exams, onEdit, onDelete, onView, onToggleStatus }) => {
  const router = useRouter();

  const handleExamClick = (exam) => {
    router.push(`/exam/${exam._id}`);
  };
  if (!exams || exams.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-xl border border-gray-200/50 shadow-lg animate-fadeIn">
        <div className="text-6xl mb-4 animate-float">📝</div>
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
          No Exams Found
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto">
          Create your first exam to get started with organizing your assessments
          and tracking performance.
        </p>
        <div className="mt-6">
          <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-medium">
            <FaClipboardList className="w-4 h-4" />
            <span>Ready to create your first exam?</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 p-4 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-xs text-left text-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                Exam Details
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {exams.map((exam, index) => (
              <tr
                key={exam._id || exam.id || index}
                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group ${
                  exam.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                }`}
              >
                <td className="">
                  <div className="">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span
                        onClick={() => handleExamClick(exam)}
                        className={`text-sm font-semibold truncate group-hover:text-blue-700 transition-colors duration-200 cursor-pointer hover:underline ${
                          exam.status === "inactive"
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {exam.name}
                      </span>
                      <div className=" inline-flex items-center ">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          exam.status === "active"
                            ? "bg-green-100 text-green-800"
                            : exam.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : exam.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                          {(exam.status || "active").charAt(0).toUpperCase() +
                            (exam.status || "active").slice(1)}
                        </span>
                        {exam.date && (
                          <span className="text-xs text-gray-500">
                            {new Date(exam.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleExamClick(exam)}
                      className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                      title="View Exam Details"
                    >
                      <FaEye className="text-sm group-hover:scale-110 transition-transform duration-200" />
                    </button>
                    {onView && (
                      <button
                        onClick={() => onView(exam)}
                        className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        title="View Exam"
                      >
                        <FaEye className="text-sm group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(exam)}
                        className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        title="Edit Exam"
                      >
                        <FaEdit className="text-sm group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(exam)}
                        className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        title="Delete Exam"
                      >
                        <FaTrash className="text-sm group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(exam)}
                        className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                        title={
                          exam.status === "active"
                            ? "Deactivate Exam"
                            : "Activate Exam"
                        }
                      >
                        <FaPowerOff className="text-sm group-hover:scale-110 transition-transform duration-200" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 divide-y divide-gray-100">
        {exams.map((exam, index) => (
          <div
            key={exam._id || exam.id || index}
            className={`p-4 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-l-4 border-transparent hover:border-blue-500 group animate-fadeIn ${
              exam.status === "inactive" ? "opacity-60 bg-gray-50" : ""
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                      {exam.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => handleExamClick(exam)}
                      className={`text-sm sm:text-base font-semibold truncate group-hover:text-blue-700 transition-colors duration-200 cursor-pointer hover:underline ${
                        exam.status === "inactive"
                          ? "text-gray-500 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {exam.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          exam.status === "active"
                            ? "bg-green-100 text-green-800"
                            : exam.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : exam.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {(exam.status || "active").charAt(0).toUpperCase() +
                          (exam.status || "active").slice(1)}
                      </span>
                      {exam.date && (
                        <span className="text-xs text-gray-500">
                          {new Date(exam.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => handleExamClick(exam)}
                  className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                  title="View Exam Details"
                >
                  <FaEye className="text-sm group-hover:scale-110 transition-transform duration-200" />
                </button>
                {onView && (
                  <button
                    onClick={() => onView(exam)}
                    className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                    title="View Exam"
                  >
                    <FaEye className="text-sm group-hover:scale-110 transition-transform duration-200" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(exam)}
                    className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                    title="Edit Exam"
                  >
                    <FaEdit className="text-sm group-hover:scale-110 transition-transform duration-200" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(exam)}
                    className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                    title="Delete Exam"
                  >
                    <FaTrash className="text-sm group-hover:scale-110 transition-transform duration-200" />
                  </button>
                )}
                {onToggleStatus && (
                  <button
                    onClick={() => onToggleStatus(exam)}
                    className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                    title={
                      exam.status === "active"
                        ? "Deactivate Exam"
                        : "Activate Exam"
                    }
                  >
                    <FaPowerOff className="text-sm group-hover:scale-110 transition-transform duration-200" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamTable;
