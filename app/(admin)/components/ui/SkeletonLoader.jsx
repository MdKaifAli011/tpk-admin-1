"use client";
import React from "react";

// Enhanced base skeleton component with better animations
const SkeletonBase = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg ${className}`}
    style={{
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s ease-in-out infinite",
    }}
    {...props}
  />
);

// Enhanced skeleton for text lines with varying widths and better typography
export const SkeletonText = ({
  lines = 1,
  className = "",
  width = "w-full",
  height = "h-4",
  variant = "default",
}) => {
  const heightClasses = {
    small: "h-3",
    default: "h-4",
    large: "h-5",
    xlarge: "h-6",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={`${width} ${heightClasses[variant] || height} ${
            index === lines - 1 ? "w-3/4" : ""
          }`}
        />
      ))}
    </div>
  );
};

// Enhanced skeleton for buttons with better sizing
export const SkeletonButton = ({ className = "", size = "default" }) => {
  const sizeClasses = {
    small: "h-8 w-20",
    default: "h-10 w-24",
    large: "h-12 w-32",
  };

  return (
    <SkeletonBase className={`rounded-lg ${sizeClasses[size]} ${className}`} />
  );
};

// Enhanced skeleton for cards with more realistic structure
export const SkeletonCard = ({ className = "" }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 ${className}`}
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBase className="h-8 w-48" />
        <SkeletonButton />
      </div>
      <SkeletonText lines={2} width="w-3/4" />
      <div className="flex gap-2">
        <SkeletonButton size="small" />
        <SkeletonButton size="small" />
      </div>
    </div>
  </div>
);

// Enhanced skeleton for table rows with more realistic structure
export const SkeletonTableRow = ({ columns = 4, hasDragHandle = false }) => (
  <tr className="hover:bg-gray-50/50 transition-colors duration-200">
    {hasDragHandle && (
      <td className="px-4 lg:px-6 py-4">
        <SkeletonBase className="h-4 w-4 rounded" />
      </td>
    )}
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 lg:px-6 py-4">
        <SkeletonBase
          className={`h-4 ${
            index === 0 ? "w-32" : index === columns - 1 ? "w-20" : "w-full"
          }`}
        />
      </td>
    ))}
  </tr>
);

// Enhanced skeleton for table with more realistic structure
export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className = "",
  hasDragHandle = false,
}) => (
  <div
    className={`overflow-x-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 ${className}`}
  >
    <table className="min-w-full text-sm text-left text-gray-700">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <tr>
          {hasDragHandle && <th className="px-4 lg:px-6 py-4 w-12"></th>}
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-4 lg:px-6 py-4">
              <SkeletonBase className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonTableRow
            key={index}
            columns={columns}
            hasDragHandle={hasDragHandle}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// Enhanced loading spinner component
export const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-8 w-8",
    xlarge: "h-12 w-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

// Enhanced loading state wrapper with better functionality
export const LoadingWrapper = ({ isLoading, children, skeleton }) => {
  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        {skeleton || <SkeletonTable rows={5} columns={4} />}
      </div>
    );
  }
  return children;
};

// Enhanced skeleton for page content with more realistic structure
export const SkeletonPageContent = () => (
  <div className="space-y-6 sm:space-y-8">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-gray-200/50 p-6 sm:p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-8 w-48" />
          <SkeletonButton />
        </div>
        <SkeletonText lines={2} width="w-3/4" variant="large" />
      </div>
    </div>

    {/* Table Section */}
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="space-y-2">
          <SkeletonBase className="h-6 w-32" />
          <SkeletonBase className="h-4 w-64" />
        </div>
      </div>
      <div className="p-6">
        <SkeletonTable rows={5} columns={4} />
      </div>
    </div>
  </div>
);

// Specialized skeleton for chapters table (with drag handle)
export const SkeletonChaptersTable = () => (
  <div className="space-y-6 sm:space-y-8">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-gray-200/50 p-6 sm:p-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-8 w-48" />
          <SkeletonButton />
        </div>
        <SkeletonText lines={2} width="w-3/4" variant="large" />
      </div>
    </div>

    {/* Table Section */}
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="space-y-2">
          <SkeletonBase className="h-6 w-32" />
          <SkeletonBase className="h-4 w-64" />
        </div>
      </div>
      <div className="p-6">
        <SkeletonTable rows={5} columns={6} hasDragHandle={true} />
      </div>
    </div>
  </div>
);

export default SkeletonBase;

