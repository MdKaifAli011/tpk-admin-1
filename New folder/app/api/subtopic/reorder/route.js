import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SubTopic from "@/models/SubTopic";

export async function POST(request) {
  return handleReorder(request);
}

export async function PATCH(request) {
  return handleReorder(request);
}

async function handleReorder(request) {
  try {
    await connectDB();
    const { subTopics } = await request.json();

    if (!subTopics || !Array.isArray(subTopics)) {
      return NextResponse.json(
        { success: false, message: "Invalid subTopics data" },
        { status: 400 }
      );
    }

    // Two-step update to prevent duplicate key errors
    // Step 1: Set all subTopics to temporary high order numbers
    const tempUpdates = subTopics.map((subTopic, index) => ({
      updateOne: {
        filter: { _id: subTopic.id },
        update: { orderNumber: 10000 + index },
      },
    }));

    await SubTopic.bulkWrite(tempUpdates);

    // Step 2: Set all subTopics to their final order numbers
    const finalUpdates = subTopics.map((subTopic) => ({
      updateOne: {
        filter: { _id: subTopic.id },
        update: { orderNumber: subTopic.orderNumber },
      },
    }));

    await SubTopic.bulkWrite(finalUpdates);

    return NextResponse.json({
      success: true,
      message: "SubTopics reordered successfully",
    });
  } catch (error) {
    console.error("❌ Error reordering subTopics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder subTopics" },
      { status: 500 }
    );
  }
}
