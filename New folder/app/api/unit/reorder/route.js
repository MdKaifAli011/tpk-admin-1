import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Unit from "@/models/Unit";
import mongoose from "mongoose";

// ---------- REORDER UNITS ----------
export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { units } = body;

    if (!Array.isArray(units) || units.length === 0) {
      return NextResponse.json(
        { success: false, message: "Units array is required" },
        { status: 400 }
      );
    }

    // Validate all unit IDs
    for (const unit of units) {
      if (!mongoose.Types.ObjectId.isValid(unit.id)) {
        return NextResponse.json(
          { success: false, message: `Invalid unit ID: ${unit.id}` },
          { status: 400 }
        );
      }
    }

    // Strategy: Use temporary high order numbers to avoid conflicts
    const tempOrderBase = 10000;

    // Step 1: Set all units to temporary order numbers
    for (let i = 0; i < units.length; i++) {
      await Unit.findByIdAndUpdate(units[i].id, {
        orderNumber: tempOrderBase + i,
      });
    }

    // Step 2: Set all units to their final order numbers
    for (const unit of units) {
      await Unit.findByIdAndUpdate(unit.id, {
        orderNumber: unit.orderNumber,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Units reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering units:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder units" },
      { status: 500 }
    );
  }
}
