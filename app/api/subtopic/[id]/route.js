import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SubTopic from "@/models/SubTopic";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const subTopic = await SubTopic.findById(id)
      .populate("examId", "name")
      .populate("subjectId", "name")
      .populate("unitId", "name")
      .populate("chapterId", "name")
      .populate("topicId", "name");

    if (!subTopic) {
      return NextResponse.json(
        { success: false, message: "SubTopic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subTopic,
    });
  } catch (error) {
    console.error("❌ Error fetching subtopic:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subtopic" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      examId,
      subjectId,
      unitId,
      chapterId,
      topicId,
      orderNumber,
      content,
      title,
      metaDescription,
      keywords,
    } = body;

    // Capitalize first letter of each word in subtopic name
    const subTopicName = name
      ? name.trim().replace(/\b\w/g, (l) => l.toUpperCase())
      : "";

    const updateData = {
      name: subTopicName,
      examId,
      subjectId,
      unitId,
      chapterId,
      topicId,
      orderNumber,
      content,
      title,
      metaDescription,
      keywords,
    };

    const updatedSubTopic = await SubTopic.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("examId", "name")
      .populate("subjectId", "name")
      .populate("unitId", "name")
      .populate("chapterId", "name")
      .populate("topicId", "name");

    if (!updatedSubTopic) {
      return NextResponse.json(
        { success: false, message: "SubTopic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSubTopic,
    });
  } catch (error) {
    console.error("❌ Error updating subtopic:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subtopic" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedSubTopic = await SubTopic.findByIdAndDelete(id);

    if (!deletedSubTopic) {
      return NextResponse.json(
        { success: false, message: "SubTopic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SubTopic deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting subtopic:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subtopic" },
      { status: 500 }
    );
  }
}

