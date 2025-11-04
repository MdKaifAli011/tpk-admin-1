import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Exam from "@/models/Exam";
// Import all models to ensure they're registered before middleware runs
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";
import Topic from "@/models/Topic";
import SubTopic from "@/models/SubTopic";
import mongoose from "mongoose";

// ---------- GET SINGLE EXAM ----------
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const exam = await Exam.findById(id);

    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Exam fetched successfully",
      data: exam,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

// ---------- UPDATE EXAM ----------
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    // Extract all possible fields from the request body
    const { name, status, content, title, metaDescription, keywords } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Exam name is required" },
        { status: 400 }
      );
    }

    // Capitalize exam name
    const examName = name.trim().toUpperCase();

    // Check for duplicate name if name is being updated
    if (name) {
      const duplicate = await Exam.findOne({
        name: examName,
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Exam with same name already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update data - always include all fields to ensure they're saved
    const updateData = {
      name: examName,
      content: content || "",
      title: title || "",
      metaDescription: metaDescription || "",
      keywords: keywords || "",
    };

    // Only update status if it's provided
    if (status) {
      updateData.status = status;
    }

    const updated = await Exam.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Exam updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update exam" },
      { status: 500 }
    );
  }
}

// ---------- PATCH EXAM (Status Update with Cascading) ----------
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const { status } = body;

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid status is required (active or inactive)",
        },
        { status: 400 }
      );
    }

    // Update exam status
    const updated = await Exam.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    // Cascading: Update all children status
    console.log(`🔄 Cascading status update to ${status} for exam ${id}`);

    const subTopicsResult = await SubTopic.updateMany(
      { examId: id },
      { status }
    );
    console.log(`✅ Updated ${subTopicsResult.modifiedCount} SubTopics`);

    const topicsResult = await Topic.updateMany({ examId: id }, { status });
    console.log(`✅ Updated ${topicsResult.modifiedCount} Topics`);

    const chaptersResult = await Chapter.updateMany({ examId: id }, { status });
    console.log(`✅ Updated ${chaptersResult.modifiedCount} Chapters`);

    const unitsResult = await Unit.updateMany({ examId: id }, { status });
    console.log(`✅ Updated ${unitsResult.modifiedCount} Units`);

    const subjectsResult = await Subject.updateMany({ examId: id }, { status });
    console.log(`✅ Updated ${subjectsResult.modifiedCount} Subjects`);

    return NextResponse.json({
      success: true,
      message: `Exam and all children ${
        status === "inactive" ? "deactivated" : "activated"
      } successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating exam status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update exam status" },
      { status: 500 }
    );
  }
}

// ---------- DELETE EXAM ----------
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam ID" },
        { status: 400 }
      );
    }

    const deleted = await Exam.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
