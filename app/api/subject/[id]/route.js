import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
// Import all child models to ensure they're registered before middleware runs
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";
import Topic from "@/models/Topic";
import SubTopic from "@/models/SubTopic";
import mongoose from "mongoose";

// ---------- GET SINGLE SUBJECT ----------
export async function GET(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const subject = await Subject.findById(id).populate(
      "examId",
      "name status"
    );
    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    console.error("❌ Error fetching subject:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

// ---------- UPDATE SUBJECT ----------
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subject ID" },
        { status: 400 }
      );
    }

    // Extract all possible fields from the request body
    const {
      name,
      examId,
      orderNumber,
      content,
      title,
      metaDescription,
      keywords,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Subject name is required" },
        { status: 400 }
      );
    }

    // Capitalize first letter of each word in subject name
    const subjectName = name.trim().replace(/\b\w/g, (l) => l.toUpperCase());

    // Check for duplicate name if name is being updated
    if (name) {
      const duplicate = await Subject.findOne({
        name: subjectName,
        _id: { $ne: id },
        ...(examId && { examId }),
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Subject with same name already exists" },
          { status: 409 }
        );
      }
    }

    // Prepare update data - always include all fields to ensure they're saved
    const updateData = {
      name: subjectName,
      content: content || "",
      title: title || "",
      metaDescription: metaDescription || "",
      keywords: keywords || "",
    };

    // Only update fields if provided
    if (examId) {
      updateData.examId = examId;
    }
    if (orderNumber !== undefined) {
      updateData.orderNumber = orderNumber;
    }

    const updated = await Subject.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        upsert: false,
        runValidators: true,
      }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    // Populate the exam data before returning
    const populatedSubject = await Subject.findById(updated._id).populate(
      "examId",
      "name status"
    );

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully",
      data: populatedSubject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subject" },
      { status: 500 }
    );
  }
}

// ---------- PATCH SUBJECT (Reorder) ----------
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { orderNumber } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subject ID" },
        { status: 400 }
      );
    }

    if (orderNumber === undefined || orderNumber === null) {
      return NextResponse.json(
        { success: false, message: "Order number is required" },
        { status: 400 }
      );
    }

    const updated = await Subject.findByIdAndUpdate(
      id,
      { orderNumber },
      { new: true, runValidators: true }
    ).populate("examId", "name status");

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Subject order updated to ${orderNumber}`,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating subject order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subject order" },
      { status: 500 }
    );
  }
}

// ---------- DELETE SUBJECT ----------
export async function DELETE(_request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subject" },
      { status: 500 }
    );
  }
}

