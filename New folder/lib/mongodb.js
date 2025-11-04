import mongoose from "mongoose";
import { config } from "@/config/config";

export const connectDB = async () => {
  try {
    console.log("🔄Connecting to MongoDB...");
    await mongoose.connect(config.mongoUri, {
      dbName: config.mongoDbName,
    });
    console.log("✅Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌Error connecting to MongoDB:", error);
    throw error;
  }
};
export default connectDB;
