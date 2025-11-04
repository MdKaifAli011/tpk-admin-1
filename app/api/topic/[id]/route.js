import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
// Import child model to ensure it's registered before middleware runs
import SubTopic from "@/models/SubTopic";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const topic = await Topic.findById(id)
      .populate("examId", "name")
      .populate("subjectId", "name")
      .populate("unitId", "name")
      .populate("chapterId", "name");

    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: topic,
    });
  } catch (error) {
    console.error("❌ Error fetching topic:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch topic" },
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
      orderNumber,
      content,
      title,
      metaDescription,
      keywords,
    } = body;

    // Capitalize first letter of each word in topic name
    const topicName = name
      ? name.trim().replace(/\b\w/g, (l) => l.toUpperCase())
      : "";

    const updateData = {
      name: topicName,
      examId,
      subjectId,
      unitId,
      chapterId,
      orderNumber,
      content,
      title: title || "",
      metaDescription,
      keywords,
    };

    const updatedTopic = await Topic.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("examId", "name")
      .populate("subjectId", "name")
      .populate("unitId", "name")
      .populate("chapterId", "name");

    if (!updatedTopic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTopic,
    });
  } catch (error) {
    console.error("❌ Error updating topic:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update topic" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedTopic = await Topic.findByIdAndDelete(id);

    if (!deletedTopic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting topic:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete topic" },
      { status: 500 }
    );
  }
}

