import express from "express"
import cors from "cors"
import path from "path"
import dotenv from "dotenv"

dotenv.config()

import { connectDB } from "./config/database"
import AuthRouter from "./routes/auth.routes"
import ActivityRouter from "./routes/activity.routes"
import BookingRouter from "./routes/booking.routes"
import ReviewRouter from "./routes/review.routes"
import AdminRouter from "./routes/admin.routes"
import ChatbotRouter from "./routes/chatbot.routes"

const PORT = process.env.PORT || 3000
const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// API Routes
app.use("/api/v1/auth", AuthRouter)
app.use("/api/v1/activities", ActivityRouter)
app.use("/api/v1/bookings", BookingRouter)
app.use("/api/v1/reviews", ReviewRouter)
app.use("/api/v1/admin", AdminRouter)
app.use("/api/v1/chat", ChatbotRouter)

// Health Check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK", service: "Tourist Discovery & Booking API" })
})

// Start Database & Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
