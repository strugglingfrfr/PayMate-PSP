import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${env.MONGODB_URI}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
