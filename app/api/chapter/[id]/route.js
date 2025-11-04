import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chapter from "@/models/Chapter";
// Import all child models to ensure they're registered before middleware runs
import Topic from "@/models/Topic";
import SubTopic from "@/models/SubTopic";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const chapter = await Chapter.findById(id)
      .populate("examId", "name")
      .populate("subjectId", "name")
      .populate("unitId", "name");

    if (!chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required" },
        { status: 400 }
      );
    }

    // Extract fields from request body
    const {
      name,
      examId,
      subjectId,
      unitId,
      orderNumber,
      content,
      title,
      metaDescription,
      keywords,
    } = body;

    // Capitalize first letter of each word in chapter name
    const chapterName = name
      ? name.trim().replace(/\b\w/g, (l) => l.toUpperCase())
      : "";

    // Prepare update data
    const updateData = {
      name: chapterName,
      content: content || "",
      title: title || "",
      metaDescription: metaDescription || "",
      keywords: keywords || "",
    };

    // Only update these fields if they are provided
    if (examId) updateData.examId = examId;
    if (subjectId) updateData.subjectId = subjectId;
    if (unitId) updateData.unitId = unitId;
    if (orderNumber !== undefined) updateData.orderNumber = orderNumber;

    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("examId", "name")
      .populate("subjectId", "name")
      .populate("unitId", "name");

    if (!updatedChapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedChapter,
      message: "Chapter updated successfully",
    });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Chapter ID is required" },
        { status: 400 }
      );
    }

    const deletedChapter = await Chapter.findByIdAndDelete(id);

    if (!deletedChapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}

