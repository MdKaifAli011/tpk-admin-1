import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Definition from "@/models/Definition";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import Unit from "@/models/Unit";
import Topic from "@/models/Topic";
import SubTopic from "@/models/SubTopic";
import mongoose from "mongoose";
import { parsePagination, createPaginationResponse } from "@/utils/pagination";
import { successResponse, errorResponse, handleApiError } from "@/utils/apiResponse";
import { STATUS, ERROR_MESSAGES } from "@/constants";
import { requireAuth, requireAction } from "@/middleware/authMiddleware";

// ---------- GET ALL DEFINITIONS ----------
export async function GET(request) {
  try {
    // Check authentication (all authenticated users can view)
    const authCheck = await requireAuth(request);
    if (authCheck.error) {
      return NextResponse.json(authCheck, { status: authCheck.status || 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Parse pagination
    const { page, limit, skip } = parsePagination(searchParams);
    
    // Get filters (normalize status to lowercase for case-insensitive matching)
    const topicId = searchParams.get("topicId");
    const subTopicId = searchParams.get("subTopicId");
    const statusFilterParam = searchParams.get("status") || STATUS.ACTIVE;
    const statusFilter = statusFilterParam.toLowerCase();

    // Build query with case-insensitive status matching
    const filter = {};
    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return errorResponse("Invalid topicId", 400);
      }
      filter.topicId = topicId;
    }
    if (subTopicId) {
      if (!mongoose.Types.ObjectId.isValid(subTopicId)) {
        return errorResponse("Invalid subTopicId", 400);
      }
      filter.subTopicId = subTopicId;
    }
    if (statusFilter !== "all") {
      filter.status = { $regex: new RegExp(`^${statusFilter}$`, "i") };
    }

    // Get total count
    const total = await Definition.countDocuments(filter);

    // Fetch definitions with pagination
    const definitions = await Definition.find(filter)
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .populate("chapterId", "name orderNumber")
      .populate("topicId", "name orderNumber")
      .populate("subTopicId", "name orderNumber")
      .sort({ orderNumber: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      createPaginationResponse(definitions, total, page, limit)
    );
  } catch (error) {
    return handleApiError(error, ERROR_MESSAGES.FETCH_FAILED);
  }
}

// ---------- CREATE NEW DEFINITION ----------
export async function POST(request) {
  try {
    // Check authentication and permissions (users need to be able to create)
    const authCheck = await requireAction(request, "POST");
    if (authCheck.error) {
      return NextResponse.json(authCheck, { status: authCheck.status || 401 });
    }

    await connectDB();
    const body = await request.json();

    // Normalize to array to support both single and multiple creations
    const items = Array.isArray(body) ? body : [body];

    // Basic shape validation
    for (const item of items) {
      const { name, examId, subjectId, unitId, chapterId, topicId, subTopicId } = item || {};
      if (!name || !examId || !subjectId || !unitId || !chapterId || !topicId || !subTopicId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Definition name, exam, subject, unit, chapter, topic, and subtopic are required",
          },
          { status: 400 }
        );
      }

      const objectIds = { examId, subjectId, unitId, chapterId, topicId, subTopicId };
      for (const [key, value] of Object.entries(objectIds)) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return NextResponse.json(
            { success: false, message: `Invalid ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Verify referenced documents exist (using first item's ids; all items use same ids from UI)
    const { examId, subjectId, unitId, chapterId, topicId, subTopicId } = items[0];
    const Chapter = (await import("@/models/Chapter")).default;
    const [exam, subject, unit, chapter, topic, subTopic] = await Promise.all([
      Exam.findById(examId),
      Subject.findById(subjectId),
      Unit.findById(unitId),
      Chapter.findById(chapterId),
      Topic.findById(topicId),
      SubTopic.findById(subTopicId),
    ]);
    if (!exam)
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    if (!subject)
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      );
    if (!unit)
      return NextResponse.json(
        { success: false, message: "Unit not found" },
        { status: 404 }
      );
    if (!chapter)
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    if (!topic)
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
      );
    if (!subTopic)
      return NextResponse.json(
        { success: false, message: "SubTopic not found" },
        { status: 404 }
      );

    // Process creations sequentially to compute per-subtopic order and check duplicates
    const createdDefinitions = [];
    for (const item of items) {
      const { name, subTopicId } = item;

      // Capitalize first letter of each word in definition name (excluding And, Of, Or, In)
      const { toTitleCase } = await import("@/utils/titleCase");
      const definitionName = toTitleCase(name);

      // Duplicate name within same subtopic check
      const existingDefinition = await Definition.findOne({
        name: definitionName,
        subTopicId,
      });
      if (existingDefinition) {
        return NextResponse.json(
          {
            success: false,
            message: "Definition name already exists in this subtopic",
          },
          { status: 409 }
        );
      }

      // Determine order number
      let finalOrderNumber = item.orderNumber;
      if (!finalOrderNumber) {
        const lastDefinition = await Definition.findOne({ subTopicId })
          .sort({ orderNumber: -1 })
          .select("orderNumber");
        finalOrderNumber = lastDefinition ? lastDefinition.orderNumber + 1 : 1;
      }

      // Create new definition (content/SEO fields are now in DefinitionDetails)
      const doc = await Definition.create({
        name: definitionName,
        examId: item.examId,
        subjectId: item.subjectId,
        unitId: item.unitId,
        chapterId: item.chapterId,
        topicId: item.topicId,
        subTopicId,
        orderNumber: finalOrderNumber,
        status: item.status || STATUS.ACTIVE,
      });
      createdDefinitions.push(doc._id);
    }

    // Populate and return
    const populated = await Definition.find({ _id: { $in: createdDefinitions } })
      .populate("examId", "name status")
      .populate("subjectId", "name")
      .populate("unitId", "name orderNumber")
      .populate("chapterId", "name orderNumber")
      .populate("topicId", "name orderNumber")
      .populate("subTopicId", "name orderNumber")
      .lean();

    return successResponse(
      populated,
      `Definition${createdDefinitions.length > 1 ? "s" : ""} created successfully`,
      201
    );
  } catch (error) {
    return handleApiError(error, ERROR_MESSAGES.SAVE_FAILED);
  }
}

