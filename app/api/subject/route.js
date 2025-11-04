import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import mongoose from "mongoose";

// ---------- GET ALL SUBJECTS ----------
export async function GET() {
  try {
    await connectDB();
    const subjects = await Subject.find()
      .populate("examId", "name status")
      .sort({ examId: 1, orderNumber: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error("❌ Error fetching subjects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

// ---------- CREATE SUBJECT ----------
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, examId, orderNumber } = body;

    // Validate required fields
    if (!name || !examId) {
      return NextResponse.json(
        { success: false, message: "Name and examId are required" },
        { status: 400 }
      );
    }

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { success: false, message: "Invalid examId format" },
        { status: 400 }
      );
    }

    // Check if exam exists
    const Exam = (await import("@/models/Exam")).default;
    const examExists = await Exam.findById(examId);
    if (!examExists) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // Capitalize first letter of each word in subject name
    const subjectName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

    // Check for duplicate subject name within the same exam
    const existingSubject = await Subject.findOne({
      name: subjectName,
      examId,
    });
    if (existingSubject) {
      return NextResponse.json(
        {
          success: false,
          message: "Subject with this name already exists for this exam",
        },
        { status: 409 }
      );
    }

    // Determine orderNumber: if provided, use it; otherwise assign next available within this exam
    let finalOrderNumber = orderNumber;
    if (finalOrderNumber === undefined || finalOrderNumber === null) {
      const maxOrderDoc = await Subject.find({
        examId,
        orderNumber: { $exists: true },
      })
        .sort({ orderNumber: -1 })
        .limit(1);
      finalOrderNumber =
        maxOrderDoc.length > 0 ? (maxOrderDoc[0].orderNumber || 0) + 1 : 1;
    }

    // Create new subject
    const subject = await Subject.create({
      name: subjectName,
      examId,
      orderNumber: finalOrderNumber,
    });

    // Populate the exam data before returning
    const populatedSubject = await Subject.findById(subject._id).populate(
      "examId",
      "name status"
    );

    return NextResponse.json(
      {
        success: true,
        message: `Subject created successfully with order number ${finalOrderNumber}`,
        data: populatedSubject,
        orderNumber: finalOrderNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating subject:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create subject" },
      { status: 500 }
    );
  }
}

