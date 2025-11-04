import { NextResponse } from "next/server";
import mongoose from "mongoose";
import SubTopic from "@/models/SubTopic";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";
import Topic from "@/models/Topic";

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌MongoDB connection error:", error);
    throw error;
  }
};

// ---------- GET ALL SUBTOPICS ----------
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    const filter = {};
    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return NextResponse.json(
          { success: false, message: "Invalid topicId" },
          { status: 400 }
        );
      }
      filter.topicId = topicId;
    }

    const subTopics = await SubTopic.find(filter)
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .populate("chapterId", "name orderNumber")
      .populate("topicId", "name orderNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: subTopics.length,
      data: subTopics,
    });
  } catch (error) {
    console.error("❌ Error fetching sub topics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sub topics",
      },
      { status: 500 }
    );
  }
}

// ---------- CREATE NEW SUBTOPIC ----------
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Normalize to array to support both single and multiple creations
    const items = Array.isArray(body) ? body : [body];

    // Basic shape validation on each item
    for (const item of items) {
      const { name, examId, subjectId, unitId, chapterId, topicId } =
        item || {};
      if (!name || !examId || !subjectId || !unitId || !chapterId || !topicId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Sub topic name, exam, subject, unit, chapter, and topic are required",
          },
          { status: 400 }
        );
      }
      const objectIds = { examId, subjectId, unitId, chapterId, topicId };
      for (const [key, value] of Object.entries(objectIds)) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return NextResponse.json(
            { success: false, message: `Invalid ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Verify referenced documents exist (using first item's ids; UI shares the same ids across items)
    const { examId, subjectId, unitId, chapterId } = items[0];
    const [exam, subject, unit, chapter] = await Promise.all([
      Exam.findById(examId),
      Subject.findById(subjectId),
      Unit.findById(unitId),
      Chapter.findById(chapterId),
    ]);
    if (!exam)
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    if (!subject)
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    if (!unit)
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    if (!chapter)
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );

    const createdIds = [];
    for (const item of items) {
      const { name, topicId } = item;

      // Ensure topic exists for each item
      const topic = await Topic.findById(topicId);
      if (!topic) {
        return NextResponse.json(
          { success: false, message: "Topic not found" },
          { status: 404 }
        );
      }

      // Capitalize first letter of each word in subtopic name
      const subTopicName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

      // Duplicate name within same topic check
      const existingSubTopic = await SubTopic.findOne({
        name: subTopicName,
        topicId,
      });
      if (existingSubTopic) {
        return NextResponse.json(
          {
            success: false,
            message: "Sub topic name already exists in this topic",
          },
          { status: 409 }
        );
      }

      // Determine order number
      let finalOrderNumber = item.orderNumber;
      if (!finalOrderNumber) {
        const last = await SubTopic.findOne({ topicId })
          .sort({ orderNumber: -1 })
          .select("orderNumber");
        finalOrderNumber = last ? last.orderNumber + 1 : 1;
      }

      const doc = await SubTopic.create({
        name: subTopicName,
        examId: item.examId,
        subjectId: item.subjectId,
        unitId: item.unitId,
        chapterId: item.chapterId,
        topicId,
        orderNumber: finalOrderNumber,
      });
      createdIds.push(doc._id);
    }

    const populated = await SubTopic.find({ _id: { $in: createdIds } })
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .populate("chapterId", "name orderNumber")
      .populate("topicId", "name orderNumber");

    return NextResponse.json(
      {
        success: true,
        message: `Sub topic${
          createdIds.length > 1 ? "s" : ""
        } created successfully`,
        data: populated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating sub topic:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number already exists for this topic",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create sub topic",
      },
      { status: 500 }
    );
  }
}
