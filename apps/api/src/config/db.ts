import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}
