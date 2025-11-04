import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Chapter from "@/models/Chapter";

export async function POST(request) {
  return handleReorder(request);
}

export async function PATCH(request) {
  return handleReorder(request);
}

async function handleReorder(request) {
  try {
    await connectDB();

    const { chapters } = await request.json();

    // Validate input
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { success: false, message: "Chapters array is required" },
        { status: 400 }
      );
    }

    // Validate each chapter object
    for (const chapter of chapters) {
      if (!chapter.id || !chapter.orderNumber) {
        return NextResponse.json(
          {
            success: false,
            message: "Each chapter must have id and orderNumber",
          },
          { status: 400 }
        );
      }
    }

    // Two-step update strategy to avoid duplicate key conflicts
    // Step 1: Move all chapters to temporary high order numbers
    const tempUpdates = chapters.map((chapter, index) => ({
      updateOne: {
        filter: { _id: chapter.id },
        update: { orderNumber: 10000 + index },
      },
    }));

    await Chapter.bulkWrite(tempUpdates);

    // Step 2: Update all chapters to their final order numbers
    const finalUpdates = chapters.map((chapter) => ({
      updateOne: {
        filter: { _id: chapter.id },
        update: { orderNumber: chapter.orderNumber },
      },
    }));

    const result = await Chapter.bulkWrite(finalUpdates);

    return NextResponse.json({
      success: true,
      message: `Successfully reordered ${chapters.length} chapters`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error reordering chapters:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder chapters" },
      { status: 500 }
    );
  }
}

