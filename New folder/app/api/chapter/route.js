import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Chapter from "@/models/Chapter";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";

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

// ---------- GET ALL CHAPTERS ----------
export async function GET() {
  try {
    await connectDB();

    const chapters = await Chapter.find()
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: chapters.length,
      data: chapters,
    });
  } catch (error) {
    console.error("❌ Error fetching chapters:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chapters",
      },
      { status: 500 }
    );
  }
}

// ---------- CREATE NEW CHAPTER ----------
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, examId, subjectId, unitId, orderNumber } = body;

    // Validation
    if (!name || !examId || !subjectId || !unitId) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter name, exam, subject, and unit are required",
        },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exam ID",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid subject ID",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid unit ID",
        },
        { status: 400 }
      );
    }

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam not found",
        },
        { status: 404 }
      );
    }

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject not found",
        },
        { status: 404 }
      );
    }

    // Check if unit exists
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return NextResponse.json(
        {
          success: false,
          message: "Unit not found",
        },
        { status: 404 }
      );
    }

    // Capitalize first letter of each word in chapter name
    const chapterName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

    // Check if chapter name already exists in the same unit
    const existingChapter = await Chapter.findOne({
      name: chapterName,
      unitId: unitId,
    });

    if (existingChapter) {
      return NextResponse.json(
        {
          success: false,
          message: "Chapter name already exists in this unit",
        },
        { status: 409 }
      );
    }

    // Auto-generate order number if not provided
    let finalOrderNumber = orderNumber;
    if (!finalOrderNumber) {
      const lastChapter = await Chapter.findOne({ unitId })
        .sort({ orderNumber: -1 })
        .select("orderNumber");
      finalOrderNumber = lastChapter ? lastChapter.orderNumber + 1 : 1;
    }

    // Create new chapter
    const chapter = await Chapter.create({
      name: chapterName,
      examId,
      subjectId,
      unitId,
      orderNumber: finalOrderNumber,
    });

    // Populate the data before returning
    const populatedChapter = await Chapter.findById(chapter._id)
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber");

    return NextResponse.json(
      {
        success: true,
        message: "Chapter created successfully",
        data: populatedChapter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating chapter:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number already exists for this unit",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create chapter",
      },
      { status: 500 }
    );
  }
}
