import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaTrash,
  FaGripVertical,
  FaEye,
  FaPowerOff,
} from "react-icons/fa";
import { FiTrash } from "react-icons/fi";

const UnitsTable = ({ units, onEdit, onDelete, onDragEnd, onToggleStatus }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const router = useRouter();

  const handleUnitClick = (unit) => {
    router.push(`/unit/${unit._id}`);
  };

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-lg">
        <div className="text-6xl mb-4">📘</div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          No Units Found
        </h3>
        <p className="text-gray-500 text-xs">
          Add your first unit to get started.
        </p>
      </div>
    );
  }

  // Group units by Exam → Subject
  const groupedUnits = useMemo(() => {
    const groups = {};
    units.forEach((unit) => {
      const examId = unit.examId?._id || unit.examId || "unassigned";
      const examName = unit.examId?.name || "Unassigned";
      const subjectId = unit.subjectId?._id || unit.subjectId || "unassigned";
      const subjectName = unit.subjectId?.name || "Unassigned";
      const groupKey = `${examId}-${subjectId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          examId,
          examName,
          subjectId,
          subjectName,
          units: [],
        };
      }
      groups[groupKey].units.push(unit);
    });

    // Sort by exam name, then subject name
    return Object.values(groups).sort((a, b) => {
      if (a.examName !== b.examName) {
        return a.examName.localeCompare(b.examName);
      }
      return a.subjectName.localeCompare(b.subjectName);
    });
  }, [units]);

  const handleDragStart = (e, groupIndex, unitIndex) => {
    setDraggedIndex(`${groupIndex}-${unitIndex}`);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, groupIndex, unitIndex) => {
    e.preventDefault();
    const currentKey = `${groupIndex}-${unitIndex}`;
    if (!draggedIndex || draggedIndex === currentKey) return;

    const [sourceGroup, sourceIndex] = draggedIndex.split("-").map(Number);
    if (sourceGroup === groupIndex) {
      // Only allow drag within same group
      const group = groupedUnits[sourceGroup];
      const sourceUnit = group.units[sourceIndex];

      // Calculate new index in flat units array
      let flatSourceIndex = 0;
      for (let i = 0; i < sourceGroup; i++) {
        flatSourceIndex += groupedUnits[i].units.length;
      }
      flatSourceIndex += sourceIndex;

      let flatDestIndex = 0;
      for (let i = 0; i < groupIndex; i++) {
        flatDestIndex += groupedUnits[i].units.length;
      }
      flatDestIndex += unitIndex;

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
      {groupedUnits.map((group, groupIndex) => {
        // Sort units by orderNumber within each group
        const sortedUnits = [...group.units].sort((a, b) => {
          const ao = a.orderNumber || Number.MAX_SAFE_INTEGER;
          const bo = b.orderNumber || Number.MAX_SAFE_INTEGER;
          return ao - bo;
        });

        return (
          <div
            key={`${group.examId}-${group.subjectId}`}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn"
            style={{ animationDelay: `${groupIndex * 0.1}s` }}
          >
            {/* 🎯 Compact & Polished Breadcrumb Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-4 py-3 rounded-t-xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
                  {/* Exam */}
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-semibold shadow-sm hover:bg-blue-700 transition-all duration-200">
                    {group.examName}
                  </span>
                  <span className="text-gray-400 font-bold">›</span>

                  {/* Subject */}
                  <span className="px-3 py-1 bg-indigo-500 text-white rounded-full font-semibold shadow-sm hover:bg-indigo-600 transition-all duration-200">
                    {group.subjectName}
                  </span>
                  <span className="text-gray-400 font-bold">›</span>

                  {/* Units */}
                  <span className="px-3 py-1 bg-purple-500 text-white rounded-full font-semibold shadow-sm hover:bg-purple-600 transition-all duration-200">
                    {sortedUnits.length}{" "}
                    {sortedUnits.length === 1 ? "Unit" : "Units"}
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
                    <th className="px-4 py-3 text-left">Unit Name</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedUnits.map((unit, unitIndex) => {
                    const dragKey = `${groupIndex}-${unitIndex}`;
                    return (
                      <tr
                        key={unit._id || unitIndex}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, groupIndex, unitIndex)
                        }
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, groupIndex, unitIndex)}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={`hover:bg-blue-50 transition-all cursor-move ${
                          draggedIndex === dragKey ? "opacity-50" : ""
                        } ${
                          unit.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400">
                          <FaGripVertical className="cursor-grab" />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            {unit.orderNumber || unitIndex + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-base">
                          <span
                            onClick={() => handleUnitClick(unit)}
                            className={`cursor-pointer hover:text-blue-700 hover:underline transition-colors duration-200 ${
                              unit.status === "inactive"
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {unit.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleUnitClick(unit)}
                              className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                              title="View Unit Details"
                            >
                              <FaEye className="text-sm group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={() => onEdit(unit)}
                              className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                              title="Edit"
                            >
                              <FaEdit className="text-sm group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={() => onDelete(unit)}
                              className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                              title="Delete"
                            >
                              <FiTrash className="text-sm group-hover:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={() =>
                                onToggleStatus && onToggleStatus(unit)
                              }
                              className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 p-2.5 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                              title={
                                unit.status === "active"
                                  ? "Deactivate Unit"
                                  : "Activate Unit"
                              }
                            >
                              <FaPowerOff className="text-sm group-hover:scale-110 transition-transform duration-200" />
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
              {sortedUnits.map((unit, unitIndex) => {
                const dragKey = `${groupIndex}-${unitIndex}`;
                return (
                  <div
                    key={unit._id || unitIndex}
                    className={`p-4 hover:bg-blue-50 transition-all duration-150 ${
                      unit.status === "inactive" ? "opacity-60 bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleUnitClick(unit)}
                          className={`text-base font-semibold mb-1 cursor-pointer hover:text-blue-700 hover:underline transition-colors duration-200 ${
                            unit.status === "inactive"
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {unit.name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          #{unit.orderNumber || unitIndex + 1}
                        </span>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleUnitClick(unit)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition"
                          title="View Unit Details"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          onClick={() => onEdit(unit)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => onDelete(unit)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <FiTrash className="text-sm" />
                        </button>
                        <button
                          onClick={() => onToggleStatus && onToggleStatus(unit)}
                          className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition"
                          title={
                            unit.status === "active"
                              ? "Deactivate Unit"
                              : "Activate Unit"
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

export default UnitsTable;
