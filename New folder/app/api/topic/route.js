import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Topic from "@/models/Topic";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";

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

// ---------- GET ALL TOPICS ----------
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    const filter = {};
    if (chapterId) {
      if (!mongoose.Types.ObjectId.isValid(chapterId)) {
        return NextResponse.json(
          { success: false, message: "Invalid chapterId" },
          { status: 400 }
        );
      }
      filter.chapterId = chapterId;
    }

    const topics = await Topic.find(filter)
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .populate("chapterId", "name orderNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    console.error("❌ Error fetching topics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch topics",
      },
      { status: 500 }
    );
  }
}

// ---------- CREATE NEW TOPIC ----------
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Normalize to array to support both single and multiple creations
    const items = Array.isArray(body) ? body : [body];

    // Basic shape validation
    for (const item of items) {
      const { name, examId, subjectId, unitId, chapterId } = item || {};
      if (!name || !examId || !subjectId || !unitId || !chapterId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Topic name, exam, subject, unit, and chapter are required",
          },
          { status: 400 }
        );
      }

      const objectIds = { examId, subjectId, unitId, chapterId };
      for (const [key, value] of Object.entries(objectIds)) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return NextResponse.json(
            { success: false, message: `Invalid ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Verify referenced documents exist (using first item's ids; all items use same ids from UI)
    const { examId, subjectId, unitId } = items[0];
    const [exam, subject, unit] = await Promise.all([
      Exam.findById(examId),
      Subject.findById(subjectId),
      Unit.findById(unitId),
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

    // Process creations sequentially to compute per-chapter order and check duplicates
    const createdTopics = [];
    for (const item of items) {
      const { name, chapterId } = item;

      // Ensure chapter exists
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return NextResponse.json(
          { success: false, message: "Chapter not found" },
          { status: 404 }
        );
      }

      // Capitalize first letter of each word in topic name
      const topicName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

      // Duplicate name within same chapter check
      const existingTopic = await Topic.findOne({
        name: topicName,
        chapterId,
      });
      if (existingTopic) {
        return NextResponse.json(
          {
            success: false,
            message: "Topic name already exists in this chapter",
          },
          { status: 409 }
        );
      }

      // Determine order number
      let finalOrderNumber = item.orderNumber;
      if (!finalOrderNumber) {
        const lastTopic = await Topic.findOne({ chapterId })
          .sort({ orderNumber: -1 })
          .select("orderNumber");
        finalOrderNumber = lastTopic ? lastTopic.orderNumber + 1 : 1;
      }

      const doc = await Topic.create({
        name: topicName,
        examId: item.examId,
        subjectId: item.subjectId,
        unitId: item.unitId,
        chapterId,
        orderNumber: finalOrderNumber,
      });
      createdTopics.push(doc._id);
    }

    // Populate and return
    const populated = await Topic.find({ _id: { $in: createdTopics } })
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .populate("chapterId", "name orderNumber");

    return NextResponse.json(
      {
        success: true,
        message: `Topic${
          createdTopics.length > 1 ? "s" : ""
        } created successfully`,
        data: populated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating topic:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number already exists for this chapter",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create topic",
      },
      { status: 500 }
    );
  }
}
