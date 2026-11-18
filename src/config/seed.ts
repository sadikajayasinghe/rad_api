import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { UserModel, UserRole } from "../models/user.model"
import { ActivityModel } from "../models/activity.model"

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGO_LOCAL_URL ||
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/tourist_platform"

    await mongoose.connect(mongoUri)
    console.log("Connected to MongoDB for seeding...")

    // 1. Create or ensure Default Admin
    const adminEmail = "admin@tourist.lk"
    let admin = await UserModel.findOne({ email: adminEmail })
    if (!admin) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10)
      admin = await UserModel.create({
        name: "Platform Administrator",
        email: adminEmail,
        password: hashedPassword,
        roles: [UserRole.ADMIN],
        approve: true
      })
      console.log("Admin account created: admin@tourist.lk / Admin@123")
    }

    // 2. Create or ensure Sample Provider
    const providerEmail = "provider@lankasafari.lk"
    let provider = await UserModel.findOne({ email: providerEmail })
    if (!provider) {
      const hashedPassword = await bcrypt.hash("Provider@123", 10)
      provider = await UserModel.create({
        name: "Lanka Adventure Guides",
        email: providerEmail,
        password: hashedPassword,
        roles: [UserRole.PROVIDER],
        approve: true
      })
      console.log("Provider account created: provider@lankasafari.lk / Provider@123")
    }

    // 3. Seed Activities
    const sampleActivities: Array<{
      title: string
      description: string
      category: string
      location: string
      pricePerPerson: number
      duration: string
      maxParticipants: number
      images: string[]
      providerId: any
      status: "PENDING" | "APPROVED" | "REJECTED"
    }> = [
      {
        title: "Yala National Park Jeep Safari",
        description:
          "Explore wildlife and observe elephants, leopards, sloth bears, birds, and other animals with an experienced certified safari guide in a 4x4 open jeep.",
        category: "Wildlife",
        location: "Yala National Park",
        pricePerPerson: 12000,
        duration: "4 Hours",
        maxParticipants: 6,
        images: [
          "https://images.unsplash.com/photo-1544979590-37e9b47eb705"
        ],
        providerId: provider._id,
        status: "APPROVED"
      },
      {
        title: "Mirissa Whale & Dolphin Watching",
        description:
          "Join an early morning boat excursion in the Indian Ocean to witness majestic blue whales, fin whales, and playful pods of spinner dolphins in their natural habitat.",
        category: "Ocean Adventure",
        location: "Mirissa",
        pricePerPerson: 8000,
        duration: "3-5 Hours",
        maxParticipants: 25,
        images: [
          "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9"
        ],
        providerId: provider._id,
        status: "APPROVED"
      },
      {
        title: "Ella Rock & Little Adam's Peak Mountain Hike",
        description:
          "Enjoy a guided mountain trek through lush tea plantations, eucalyptus forests, and dramatic viewpoints overlooking the southern plains of Sri Lanka.",
        category: "Adventure",
        location: "Ella",
        pricePerPerson: 3500,
        duration: "3 Hours",
        maxParticipants: 12,
        images: [
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
        ],
        providerId: provider._id,
        status: "APPROVED"
      },
      {
        title: "Arugam Bay Surfing Lessons & Board Rental",
        description:
          "Learn to surf with ISA-certified local instructors on the world-renowned right-hand point breaks of Arugam Bay. Includes surfboard rental and ocean safety briefing.",
        category: "Adventure",
        location: "Arugam Bay",
        pricePerPerson: 5000,
        duration: "2 Hours",
        maxParticipants: 8,
        images: [
          "https://images.unsplash.com/photo-1502680390469-be75c86b636f"
        ],
        providerId: provider._id,
        status: "APPROVED"
      }
    ]

    for (const act of sampleActivities) {
      const exists = await ActivityModel.findOne({ title: act.title })
      if (!exists) {
        await ActivityModel.create(act)
        console.log(`Seeded activity: ${act.title}`)
      }
    }

    console.log("Database seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()
