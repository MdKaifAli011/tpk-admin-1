"use client";

import React, { useState, lazy, Suspense } from "react";
import { FaBook, FaChartLine, FaTrophy } from "react-icons/fa";
import RichContent from "./RichContent";

// Lazy load PracticeTestList to reduce initial bundle size
const PracticeTestList = lazy(() => import("./PracticeTestList"));

const TABS = ["Overview", "Discussion Forum", "Practice Test", "Performance"];

const TabsClient = ({ 
  activeTab: initialTab = TABS[0],
  content,
  details,
  examId,
  subjectId,
  unitId,
  chapterId,
  topicId,
  subTopicId,
  entityName,
  entityType,
  unitsCount,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-4">
            <div className="prose prose-sm sm:prose max-w-none">
              {content ? (
                <RichContent html={content} />
              ) : (
                <>
                  {entityType === "subject" ? (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Subject Overview
                      </h3>
                      <p className="text-gray-600">
                        Welcome to your {entityName} preparation. Here you&apos;ll find comprehensive
                        resources, study materials, and track your progress
                        across all categories and topics.
                      </p>
                    </>
                  ) : (
                    <div className="text-gray-500 italic">
                      <p>No content available for this {entityType}.</p>
                      <p className="text-xs sm:text-sm mt-2">
                        Content can be added from the admin panel.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Subject Stats - only for subject type */}
            {entityType === "subject" && unitsCount !== undefined && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <FaBook className="text-blue-600 text-2xl mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Units
                  </h4>
                  <p className="text-sm text-gray-600">
                    {unitsCount} Units
                  </p>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <FaChartLine className="text-purple-600 text-2xl mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Subject Overview
                  </h4>
                  <p className="text-sm text-gray-600">
                    Explore all units
                  </p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <FaTrophy className="text-green-600 text-2xl mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Study Resources
                  </h4>
                  <p className="text-sm text-gray-600">
                    Access study materials
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "Discussion Forum":
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Discussion Forum
            </h3>
            <p className="text-gray-600 mb-4">
              {entityType === "exam" && `Connect with fellow students preparing for ${entityName}.`}
              {entityType === "subject" && `Connect with fellow students studying ${entityName}.`}
              {entityType === "unit" && `Connect with fellow students studying ${entityName}.`}
              {entityType === "chapter" && `Connect with fellow students studying ${entityName}.`}
              {entityType === "topic" && `Ask questions and discuss ${entityName} with fellow students.`}
              {entityType === "subtopic" && `Ask questions and discuss ${entityName} with fellow students.`}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 italic">
                Discussion forum features will be available soon.
              </p>
            </div>
          </div>
        );

      case "Practice Test":
        return (
          <div>
            <Suspense fallback={
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-600">Loading practice tests...</p>
                </div>
              </div>
            }>
              <PracticeTestList
                examId={examId}
                subjectId={subjectId}
                unitId={unitId}
                chapterId={chapterId}
                topicId={topicId}
                subTopicId={subTopicId}
              />
            </Suspense>
          </div>
        );

      case "Performance":
        return (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Performance Analytics
            </h3>
            <p className="text-gray-600 mb-4">
              {entityType === "exam" && `Track your performance across all subjects in ${entityName}.`}
              {entityType === "subject" && `Track your performance in ${entityName} across all categories and topics.`}
              {entityType === "unit" && `Track your performance in ${entityName} across all chapters.`}
              {entityType === "chapter" && `Track your performance in ${entityName}.`}
              {entityType === "topic" && `Track your performance in ${entityName}.`}
              {entityType === "subtopic" && `Track your performance in ${entityName}.`}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 italic">
                Performance analytics {entityType === "exam" ? "dashboard" : ""} will be available soon.
                {entityType !== "exam" && " Monitor your progress and improve your scores!"}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-100">
      {/* Tab Navigation */}
      <nav className="flex overflow-x-auto sm:overflow-visible border-b border-gray-200 bg-gray-50">
        <div className="flex min-w-max sm:min-w-0 w-full justify-start sm:justify-around">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? "text-blue-600 border-blue-600 bg-white"
                    : "text-gray-500 hover:text-gray-700 border-transparent"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 text-gray-600 text-sm sm:text-base">
        {renderTabContent()}
      </div>
    </section>
  );
};

export default TabsClient;

