import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";
import Topic from "@/models/Topic";
import SubTopic from "@/models/SubTopic";

export async function GET() {
  try {
    await connectDB();

    console.log(
      "\n🚀 Starting migration: Adding status field to all documents...\n"
    );

    // Update Exams
    const examResult = await Exam.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(
      `✅ Exams: Added status to ${examResult.modifiedCount} documents`
    );

    // Update Subjects
    const subjectResult = await Subject.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(
      `✅ Subjects: Added status to ${subjectResult.modifiedCount} documents`
    );

    // Update Units
    const unitResult = await Unit.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(
      `✅ Units: Added status to ${unitResult.modifiedCount} documents`
    );

    // Update Chapters
    const chapterResult = await Chapter.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(
      `✅ Chapters: Added status to ${chapterResult.modifiedCount} documents`
    );

    // Update Topics
    const topicResult = await Topic.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(
      `✅ Topics: Added status to ${topicResult.modifiedCount} documents`
    );

    // Update SubTopics
    const subTopicResult = await SubTopic.updateMany(
      { status: { $exists: false } },
      { $set: { status: "active" } }
    );
    console.log(
      `✅ SubTopics: Added status to ${subTopicResult.modifiedCount} documents`
    );

    const totalModified =
      examResult.modifiedCount +
      subjectResult.modifiedCount +
      unitResult.modifiedCount +
      chapterResult.modifiedCount +
      topicResult.modifiedCount +
      subTopicResult.modifiedCount;

    console.log("\n🎉 Migration completed successfully!");
    console.log(`📊 Total documents updated: ${totalModified}\n`);

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      results: {
        exams: examResult.modifiedCount,
        subjects: subjectResult.modifiedCount,
        units: unitResult.modifiedCount,
        chapters: chapterResult.modifiedCount,
        topics: topicResult.modifiedCount,
        subTopics: subTopicResult.modifiedCount,
        total: totalModified,
      },
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return NextResponse.json(
      { success: false, message: "Migration failed", error: error.message },
      { status: 500 }
    );
  }
}
