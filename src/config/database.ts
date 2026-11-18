import mongoose from "mongoose"

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_LOCAL_URL || process.env.MONGO_URI || "mongodb://localhost:27017/tourist_platform"
    await mongoose.connect(mongoUri)
    console.log("MongoDB Connected Successfully!")
  } catch (error) {
    console.error("MongoDB Connection Failed:", error)
    process.exit(1)
  }
}
