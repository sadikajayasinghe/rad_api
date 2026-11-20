import { Response } from "express"
import { AuthRequest } from "../middleware/auth"
import { UserModel } from "../models/user.model"
import { ActivityModel } from "../models/activity.model"
import { BookingModel } from "../models/booking.model"

//Get all users
export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 })
    return res.status(200).json({ count: users.length, users })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" })
  }
}

//Approve or update user (e.g. approve provider)
export const updateUserApproval = async (req: AuthRequest, res: Response) => {
  try {
    const { approve } = req.body
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { approve: Boolean(approve) },
      { new: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      message: `User approval set to ${approve}`,
      user
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user approval" })
  }
}

// Get all activities (including PENDING, APPROVED, REJECTED)
export const getAllActivitiesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query
    const filter: any = status ? { status: String(status) } : {}

    const activities = await ActivityModel.find(filter)
      .populate("providerId", "name email approve")
      .sort({ createdAt: -1 })

    return res.status(200).json({ count: activities.length, activities })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch activities" })
  }
}

//Approve / Reject Activity
export const updateActivityStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Status must be PENDING, APPROVED, or REJECTED" })
    }

    const activity = await ActivityModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    return res.status(200).json({
      message: `Activity status updated to ${status}`,
      activity
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to update activity status" })
  }
}

// 5. Get all bookings platform-wide
export const getAllBookingsAdmin = async (_req: AuthRequest, res: Response) => {
  try {
    const bookings = await BookingModel.find()
      .populate("activityId")
      .populate("touristId", "name email")
      .sort({ createdAt: -1 })

    return res.status(200).json({ count: bookings.length, bookings })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch all bookings" })
  }
}

// 6. Dashboard metrics
export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalActivities, pendingActivities, totalBookings, bookings] =
      await Promise.all([
        UserModel.countDocuments(),
        ActivityModel.countDocuments(),
        ActivityModel.countDocuments({ status: "PENDING" }),
        BookingModel.countDocuments(),
        BookingModel.find({ status: { $ne: "CANCELLED" } }).select("totalPrice")
      ])

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    return res.status(200).json({
      totalUsers,
      totalActivities,
      pendingActivities,
      totalBookings,
      totalRevenue
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard stats" })
  }
}
