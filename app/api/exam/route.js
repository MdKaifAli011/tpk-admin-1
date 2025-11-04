import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";

// ✅ GET: Fetch all exams
export async function GET() {
  try {
    await connectDB();

    const exams = await Exam.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error("❌ Error fetching exams:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new exam
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Exam name is required" },
        { status: 400 }
      );
    }

    // Capitalize exam name
    const examName = body.name.trim().toUpperCase();

    // Check for duplicate exam name
    const existingExam = await Exam.findOne({
      name: examName,
    });

    if (existingExam) {
      return NextResponse.json(
        { success: false, message: "Exam with this name already exists" },
        { status: 409 }
      );
    }

    // Create new exam
    const newExam = await Exam.create({
      name: examName,
      status: body.status || "active",
    });

    return NextResponse.json(
      { success: true, message: "Exam created successfully", data: newExam },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating exam:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create exam" },
      { status: 500 }
    );
  }
}

