/**
 * Migration script to backfill slugs for existing records
 * Run this once after adding slug fields to models
 *
 * Usage: node scripts/migrateSlugs.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models using relative paths
import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import Unit from "../models/Unit.js";
import Chapter from "../models/Chapter.js";
import Topic from "../models/Topic.js";
import SubTopic from "../models/SubTopic.js";
import { createSlug, generateUniqueSlug } from "../utils/serverSlug.js";

// Connect to MongoDB directly (without using lib/mongodb.js to avoid path alias issues)
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGO_DB_NAME;

  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      dbName: mongoDbName,
    });
    console.log("✅ Connected to MongoDB successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
};

async function migrateSlugs() {
  try {
    console.log("🔄 Starting slug migration...");
    await connectDB();

    // Migrate Exams
    console.log("\n📝 Migrating Exam slugs...");
    const exams = await Exam.find({ slug: { $exists: false } });
    let examCount = 0;
    for (const exam of exams) {
      const baseSlug = createSlug(exam.name);
      const checkExists = async (slug, excludeId) => {
        const query = { slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await Exam.findOne(query);
        return !!existing;
      };
      exam.slug = await generateUniqueSlug(baseSlug, checkExists, exam._id);
      await exam.save();
      examCount++;
    }
    console.log(`✅ Migrated ${examCount} Exam slugs`);

    // Migrate Subjects
    console.log("\n📝 Migrating Subject slugs...");
    const subjects = await Subject.find({ slug: { $exists: false } });
    let subjectCount = 0;
    for (const subject of subjects) {
      const baseSlug = createSlug(subject.name);
      const checkExists = async (slug, excludeId) => {
        const query = { examId: subject.examId, slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await Subject.findOne(query);
        return !!existing;
      };
      subject.slug = await generateUniqueSlug(
        baseSlug,
        checkExists,
        subject._id
      );
      await subject.save();
      subjectCount++;
    }
    console.log(`✅ Migrated ${subjectCount} Subject slugs`);

    // Migrate Units
    console.log("\n📝 Migrating Unit slugs...");
    const units = await Unit.find({ slug: { $exists: false } });
    let unitCount = 0;
    for (const unit of units) {
      const baseSlug = createSlug(unit.name);
      const checkExists = async (slug, excludeId) => {
        const query = { subjectId: unit.subjectId, slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await Unit.findOne(query);
        return !!existing;
      };
      unit.slug = await generateUniqueSlug(baseSlug, checkExists, unit._id);
      await unit.save();
      unitCount++;
    }
    console.log(`✅ Migrated ${unitCount} Unit slugs`);

    // Migrate Chapters
    console.log("\n📝 Migrating Chapter slugs...");
    const chapters = await Chapter.find({ slug: { $exists: false } });
    let chapterCount = 0;
    for (const chapter of chapters) {
      const baseSlug = createSlug(chapter.name);
      const checkExists = async (slug, excludeId) => {
        const query = { unitId: chapter.unitId, slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await Chapter.findOne(query);
        return !!existing;
      };
      chapter.slug = await generateUniqueSlug(
        baseSlug,
        checkExists,
        chapter._id
      );
      await chapter.save();
      chapterCount++;
    }
    console.log(`✅ Migrated ${chapterCount} Chapter slugs`);

    // Migrate Topics
    console.log("\n📝 Migrating Topic slugs...");
    const topics = await Topic.find({ slug: { $exists: false } });
    let topicCount = 0;
    for (const topic of topics) {
      const baseSlug = createSlug(topic.name);
      const checkExists = async (slug, excludeId) => {
        const query = { chapterId: topic.chapterId, slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await Topic.findOne(query);
        return !!existing;
      };
      topic.slug = await generateUniqueSlug(baseSlug, checkExists, topic._id);
      await topic.save();
      topicCount++;
    }
    console.log(`✅ Migrated ${topicCount} Topic slugs`);

    // Migrate SubTopics
    console.log("\n📝 Migrating SubTopic slugs...");
    const subTopics = await SubTopic.find({ slug: { $exists: false } });
    let subTopicCount = 0;
    for (const subTopic of subTopics) {
      const baseSlug = createSlug(subTopic.name);
      const checkExists = async (slug, excludeId) => {
        const query = { topicId: subTopic.topicId, slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existing = await SubTopic.findOne(query);
        return !!existing;
      };
      subTopic.slug = await generateUniqueSlug(
        baseSlug,
        checkExists,
        subTopic._id
      );
      await subTopic.save();
      subTopicCount++;
    }
    console.log(`✅ Migrated ${subTopicCount} SubTopic slugs`);

    console.log("\n✅ Slug migration completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Exams: ${examCount}`);
    console.log(`   - Subjects: ${subjectCount}`);
    console.log(`   - Units: ${unitCount}`);
    console.log(`   - Chapters: ${chapterCount}`);
    console.log(`   - Topics: ${topicCount}`);
    console.log(`   - SubTopics: ${subTopicCount}`);
    console.log(
      `   - Total: ${
        examCount +
        subjectCount +
        unitCount +
        chapterCount +
        topicCount +
        subTopicCount
      }`
    );

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during slug migration:", error);
    // Close connection on error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run migration
migrateSlugs();
