import React from "react";
import { notFound } from "next/navigation";
import MainLayout from "../../../../../layout/MainLayout";
import {
  FaBook,
  FaFileAlt,
} from "react-icons/fa";
import ListItem from "../../../../../components/ListItem";
import TabsClient from "../../../../../components/TabsClient";
import NavigationClient from "../../../../../components/NavigationClient";
import { ERROR_MESSAGES } from "@/constants";
import {
  fetchExamById,
  fetchSubjectsByExam,
  fetchSubjectById,
  fetchUnitsBySubject,
  fetchUnitById,
  fetchChaptersByUnit,
  fetchChapterById,
  fetchTopicsByChapter,
  fetchTopicById,
  fetchSubTopicsByTopic,
  createSlug,
  findByIdOrSlug,
  fetchTopicDetailsById,
} from "../../../../../lib/api";
import {
  getNextTopic,
  getPreviousTopic,
} from "../../../../../lib/hierarchicalNavigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TopicPage = async ({ params }) => {
  const {
    exam: examId,
    subject: subjectSlug,
    unit: unitSlug,
    chapter: chapterSlug,
    topic: topicSlug,
  } = await params;

  // Fetch exam
  const fetchedExam = await fetchExamById(examId);
  if (!fetchedExam) {
    notFound();
  }

  const examIdValue = fetchedExam._id || examId;

  // Fetch subjects for this exam
  const fetchedSubjects = await fetchSubjectsByExam(examIdValue);

  // Find subject by slug
  const foundSubject = findByIdOrSlug(fetchedSubjects, subjectSlug);
  if (!foundSubject) {
    notFound();
  }

  // Fetch full subject data
  const fullSubjectData = await fetchSubjectById(foundSubject._id);
  const subject = fullSubjectData || foundSubject;

  // Fetch units for this subject
  const fetchedUnits = await fetchUnitsBySubject(
    foundSubject._id,
    examIdValue
  );

  // Find unit by slug
  const foundUnit = findByIdOrSlug(fetchedUnits, unitSlug);
  if (!foundUnit) {
    notFound();
  }

  // Fetch full unit data
  const fullUnitData = await fetchUnitById(foundUnit._id);
  const unit = fullUnitData || foundUnit;

  // Fetch chapters for this unit
  const fetchedChapters = await fetchChaptersByUnit(foundUnit._id);

  // Find chapter by slug
  const foundChapter = findByIdOrSlug(fetchedChapters, chapterSlug);
  if (!foundChapter) {
    notFound();
  }

  // Fetch full chapter data
  const fullChapterData = await fetchChapterById(foundChapter._id);
  const chapter = fullChapterData || foundChapter;

  // Fetch topics for this chapter
  const fetchedTopics = await fetchTopicsByChapter(foundChapter._id);

  // Find topic by slug
  const foundTopic = findByIdOrSlug(fetchedTopics, topicSlug);
  if (!foundTopic) {
    notFound();
  }

  // Fetch full topic data, details, and subtopics in parallel
  const [fullTopicData, topicDetails, fetchedSubTopics] = await Promise.all([
    fetchTopicById(foundTopic._id),
    fetchTopicDetailsById(foundTopic._id).catch(() => ({
      content: "",
      title: "",
      metaDescription: "",
      keywords: "",
    })),
    fetchSubTopicsByTopic(foundTopic._id),
  ]);

  const topic = fullTopicData || foundTopic;

  // Find current topic index for navigation
  const index = fetchedTopics.findIndex(
    (t) =>
      t._id === foundTopic._id ||
      createSlug(t.name) === topicSlug ||
      t.name?.toLowerCase() === topicSlug.toLowerCase()
  );

  const examSlug = createSlug(fetchedExam.name);
  const subjectSlugValue = subject.slug || createSlug(subject.name);
  const unitSlugValue = unit.slug || createSlug(unit.name);
  const chapterSlugValue = chapter.slug || createSlug(chapter.name);
  const topicSlugValue = topic.slug || createSlug(topic.name);

  // Calculate hierarchical navigation
  const [nextNav, prevNav] = await Promise.all([
    getNextTopic({
      examId: examIdValue,
      examSlug: examSlug,
      subjectId: foundSubject._id,
      subjectSlug: subjectSlugValue,
      unitId: foundUnit._id,
      unitSlug: unitSlugValue,
      chapterId: foundChapter._id,
      chapterSlug: chapterSlugValue,
      topicId: foundTopic._id,
      topicSlug: topicSlugValue,
      currentIndex: index,
      allItems: fetchedTopics,
    }),
    getPreviousTopic({
      examId: examIdValue,
      examSlug: examSlug,
      subjectId: foundSubject._id,
      subjectSlug: subjectSlugValue,
      unitId: foundUnit._id,
      unitSlug: unitSlugValue,
      chapterId: foundChapter._id,
      chapterSlug: chapterSlugValue,
      topicId: foundTopic._id,
      topicSlug: topicSlugValue,
      currentIndex: index,
      allItems: fetchedTopics,
    }),
  ]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="bg-linear-to-b from-purple-50/40 via-white to-purple-50/30 border border-purple-100 rounded-xl p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FaFileAlt className="text-2xl text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-indigo-900">
                    {topic.name}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {fetchedExam.name} &gt; {subject.name} &gt; {unit.name} &gt;{" "}
                    {chapter.name} &gt; {topic.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Topic Progress</p>
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
        <TabsClient
          content={topicDetails?.content}
          examId={fetchedExam._id}
          subjectId={subject._id}
          unitId={unit._id}
          chapterId={chapter._id}
          topicId={topic._id}
          entityName={topic.name}
          entityType="topic"
        />

        {/* Sub Topics Section */}
        {fetchedSubTopics.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <FaBook className="text-xl text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {fetchedExam.name} &gt; {subject.name} &gt; {unit.name} &gt; {chapter.name} &gt; {topic.name} Sub Topics
              </h2>
            </div>

            <div className="space-y-3">
              {fetchedSubTopics.map((subTopic, index) => {
                const subtopicSlug = subTopic.slug || createSlug(subTopic.name);
                return (
                  <ListItem
                    key={subTopic._id || index}
                    item={{
                      name: subTopic.name,
                      weightage: subTopic.weightage || "20%",
                      engagement: subTopic.engagement || "2.2K",
                      isCompleted: subTopic.isCompleted || false,
                      progress: subTopic.progress || 0,
                    }}
                    index={index}
                    href={`/${examSlug}/${subjectSlugValue}/${unitSlugValue}/${chapterSlugValue}/${topicSlugValue}/${subtopicSlug}`}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Navigation */}
        <NavigationClient
          backUrl={`/${examSlug}/${subjectSlugValue}/${unitSlugValue}/${chapterSlugValue}`}
          backLabel={`Back to ${chapter.name}`}
          prevNav={prevNav}
          nextNav={nextNav}
        />
      </div>
    </MainLayout>
  );
};

export default TopicPage;
