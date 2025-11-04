import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Unit from "@/models/Unit";
// Import all child models to ensure they're registered before middleware runs
import Chapter from "@/models/Chapter";
import Topic from "@/models/Topic";
import SubTopic from "@/models/SubTopic";
import mongoose from "mongoose";

// ---------- GET SINGLE UNIT ----------
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid unit ID" },
        { status: 400 }
      );
    }

    const unit = await Unit.findById(id)
      .populate("subjectId", "name")
      .populate("examId", "name status");

    if (!unit) {
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unit fetched successfully",
      data: unit,
    });
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch unit" },
      { status: 500 }
    );
  }
}

// ---------- UPDATE UNIT ----------
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid unit ID" },
        { status: 400 }
      );
    }

    // Extract all possible fields from the request body
    const {
      name,
      orderNumber,
      subjectId,
      examId,
      content,
      title,
      metaDescription,
      keywords,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Unit name is required" },
        { status: 400 }
      );
    }

    // Capitalize first letter of each word in unit name
    const unitName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

    // Prepare update data - always include all fields to ensure they're saved
    const updateData = {
      name: unitName,
      content: content || "",
      title: title || "",
      metaDescription: metaDescription || "",
      keywords: keywords || "",
    };

    // Only update other fields if they're provided
    if (orderNumber) updateData.orderNumber = orderNumber;
    if (subjectId) updateData.subjectId = subjectId;
    if (examId) updateData.examId = examId;

    const updated = await Unit.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("subjectId", "name")
      .populate("examId", "name status");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unit updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// ---------- PATCH UNIT (Partial Update) ----------
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid unit ID" },
        { status: 400 }
      );
    }

    // Extract fields from the request body
    const { orderNumber, name, subjectId, examId } = body;

    // Prepare update data - only include provided fields
    const updateData = {};

    if (orderNumber !== undefined) updateData.orderNumber = orderNumber;
    if (name !== undefined) {
      // Capitalize first letter of each word in unit name
      updateData.name = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());
    }
    if (subjectId !== undefined) updateData.subjectId = subjectId;
    if (examId !== undefined) updateData.examId = examId;

    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await Unit.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("subjectId", "name")
      .populate("examId", "name status");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unit updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update unit" },
      { status: 500 }
    );
  }
}

// ---------- DELETE UNIT ----------
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid unit ID" },
        { status: 400 }
      );
    }

    const deleted = await Unit.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unit deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
