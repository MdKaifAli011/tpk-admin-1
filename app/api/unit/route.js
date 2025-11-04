import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Unit from "@/models/Unit";
import mongoose from "mongoose";

// ---------- GET ALL UNITS ----------
export async function GET(request) {
  try {
    await connectDB();
    // Optional filters: subjectId, examId
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const examId = searchParams.get("examId");

    const query = {};
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      query.subjectId = subjectId;
    }
    if (examId && mongoose.Types.ObjectId.isValid(examId)) {
      query.examId = examId;
    }

    const units = await Unit.find(query)
      .populate("subjectId", "name")
      .populate("examId", "name status")
      .sort({ orderNumber: 1 });

    return NextResponse.json({
      success: true,
      count: units.length,
      data: units,
    });
  } catch (error) {
    console.error("❌ Error fetching units:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

// ---------- CREATE UNIT ----------
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, orderNumber, subjectId, examId } = body;

    // Validate required fields
    if (!name || !subjectId || !examId) {
      return NextResponse.json(
        { success: false, message: "Name, subjectId, and examId are required" },
        { status: 400 }
      );
    }

    // Validate ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(examId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid subjectId or examId format" },
        { status: 400 }
      );
    }

    // Check if subject and exam exist
    const Subject = (await import("@/models/Subject")).default;
    const Exam = (await import("@/models/Exam")).default;

    const subjectExists = await Subject.findById(subjectId);
    const examExists = await Exam.findById(examId);

    if (!subjectExists) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    if (!examExists) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // Capitalize first letter of each word in unit name
    const unitName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

    // Check for duplicate unit name within the same subject
    const existingUnit = await Unit.findOne({
      name: unitName,
      subjectId,
    });
    if (existingUnit) {
      return NextResponse.json(
        {
          success: false,
          message: "Unit with this name already exists in this subject",
        },
        { status: 409 }
      );
    }

    // Auto-generate orderNumber if not provided
    let finalOrderNumber = orderNumber;
    if (!finalOrderNumber) {
      const lastUnit = await Unit.findOne({ subjectId }).sort({
        orderNumber: -1,
      });
      finalOrderNumber = lastUnit ? lastUnit.orderNumber + 1 : 1;
    }

    // Create new unit
    const unit = await Unit.create({
      name: unitName,
      orderNumber: finalOrderNumber,
      subjectId,
      examId,
    });

    // Populate the data before returning
    const populatedUnit = await Unit.findById(unit._id)
      .populate("subjectId", "name")
      .populate("examId", "name status");

    return NextResponse.json(
      {
        success: true,
        message: "Unit created successfully",
        data: populatedUnit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating unit:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number already exists for this subject",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create unit" },
      { status: 500 }
    );
  }
}

