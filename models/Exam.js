import mongoose from "mongoose";
import { createSlug, generateUniqueSlug } from "../utils/serverSlug.js";

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Index for slug
examSchema.index({ slug: 1 });

// Pre-save hook to auto-generate slug
examSchema.pre("save", async function (next) {
  if (this.isModified("name") || this.isNew) {
    const baseSlug = createSlug(this.name);
    
    // Check if slug exists (excluding current document for updates)
    const checkExists = async (slug, excludeId) => {
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      const existing = await mongoose.models.Exam.findOne(query);
      return !!existing;
    };
    
    this.slug = await generateUniqueSlug(
      baseSlug,
      checkExists,
      this._id || null
    );
  }
  next();
});

// Cascading delete: When an Exam is deleted, delete all related Subjects, Units, Chapters, Topics, and SubTopics
examSchema.pre("findOneAndDelete", async function () {
  try {
    const exam = await this.model.findOne(this.getQuery());
    if (exam) {
      console.log(
        `🗑️ Cascading delete: Deleting all entities for exam ${exam._id}`
      );

      // Get models - use mongoose.model() to ensure models are loaded (works with circular deps)
      const Subject = mongoose.models.Subject || mongoose.model("Subject");
      const Unit = mongoose.models.Unit || mongoose.model("Unit");
      const Chapter = mongoose.models.Chapter || mongoose.model("Chapter");
      const Topic = mongoose.models.Topic || mongoose.model("Topic");
      const SubTopic = mongoose.models.SubTopic || mongoose.model("SubTopic");
      const ExamDetails = mongoose.models.ExamDetails || mongoose.model("ExamDetails");

      // Delete exam details first
      const examDetailsResult = await ExamDetails.deleteMany({ examId: exam._id });
      console.log(
        `🗑️ Cascading delete: Deleted ${examDetailsResult.deletedCount} ExamDetails for exam ${exam._id}`
      );

      // Since all entities have examId, we can delete them all directly by examId
      // Delete in reverse order of hierarchy to maintain referential integrity
      const subTopicsResult = await SubTopic.deleteMany({ examId: exam._id });
      console.log(
        `🗑️ Cascading delete: Deleted ${subTopicsResult.deletedCount} SubTopics for exam ${exam._id}`
      );

      const topicsResult = await Topic.deleteMany({ examId: exam._id });
      console.log(
        `🗑️ Cascading delete: Deleted ${topicsResult.deletedCount} Topics for exam ${exam._id}`
      );

      const chaptersResult = await Chapter.deleteMany({ examId: exam._id });
      console.log(
        `🗑️ Cascading delete: Deleted ${chaptersResult.deletedCount} Chapters for exam ${exam._id}`
      );

      const unitsResult = await Unit.deleteMany({ examId: exam._id });
      console.log(
        `🗑️ Cascading delete: Deleted ${unitsResult.deletedCount} Units for exam ${exam._id}`
      );

      const subjectsResult = await Subject.deleteMany({ examId: exam._id });
      console.log(
        `🗑️ Cascading delete: Deleted ${subjectsResult.deletedCount} Subjects for exam ${exam._id}`
      );
    }
  } catch (error) {
    console.error("❌ Error in Exam cascading delete middleware:", error);
    // Don't throw - allow the delete to continue even if cascading fails
  }
});

const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;
