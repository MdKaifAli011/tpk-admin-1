import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";

export async function POST(request) {
  return handleReorder(request);
}

export async function PATCH(request) {
  return handleReorder(request);
}

async function handleReorder(request) {
  try {
    await connectDB();
    const { topics } = await request.json();

    if (!topics || !Array.isArray(topics)) {
      return NextResponse.json(
        { success: false, message: "Invalid topics data" },
        { status: 400 }
      );
    }

    // Two-step update to prevent duplicate key errors
    // Step 1: Set all topics to temporary high order numbers
    const tempUpdates = topics.map((topic, index) => ({
      updateOne: {
        filter: { _id: topic.id },
        update: { orderNumber: 10000 + index },
      },
    }));

    await Topic.bulkWrite(tempUpdates);

    // Step 2: Set all topics to their final order numbers
    const finalUpdates = topics.map((topic) => ({
      updateOne: {
        filter: { _id: topic.id },
        update: { orderNumber: topic.orderNumber },
      },
    }));

    await Topic.bulkWrite(finalUpdates);

    return NextResponse.json({
      success: true,
      message: "Topics reordered successfully",
    });
  } catch (error) {
    console.error("❌ Error reordering topics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder topics" },
      { status: 500 }
    );
  }
}
