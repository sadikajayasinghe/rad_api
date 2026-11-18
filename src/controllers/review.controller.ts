import { Request, Response } from "express"
import { AuthRequest } from "../middleware/auth"
import { ReviewModel } from "../models/review.model"
import { BookingModel } from "../models/booking.model"

// 1. Submit review (Tourist)
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { activityId, bookingId, rating, comment } = req.body

    if (!activityId || !bookingId || !rating || !comment) {
      return res.status(400).json({ message: "activityId, bookingId, rating, and comment are required" })
    }

    const numericRating = Number(rating)
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    // Verify booking belongs to tourist
    const booking = await BookingModel.findOne({
      _id: bookingId,
      touristId: req.user.sub,
      activityId
    })

    if (!booking) {
      return res.status(400).json({
        message: "You can only review activities you have booked"
      })
    }

    // Check if review already exists for this booking
    const existingReview = await ReviewModel.findOne({ bookingId })
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this booking" })
    }

    const review = await ReviewModel.create({
      touristId: req.user.sub,
      activityId,
      bookingId,
      rating: numericRating,
      comment
    })

    return res.status(201).json({
      message: "Review submitted successfully",
      review
    })
  } catch (error) {
    console.error("Create Review Error:", error)
    return res.status(500).json({ message: "Failed to submit review" })
  }
}

// 2. Get all reviews for an activity
export const getActivityReviews = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params

    const reviews = await ReviewModel.find({ activityId })
      .populate("touristId", "name")
      .sort({ createdAt: -1 })

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0

    return res.status(200).json({
      count: reviews.length,
      averageRating: Number(averageRating),
      reviews
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch activity reviews" })
  }
}

// 3. Delete review (Tourist owner or Admin)
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const review = await ReviewModel.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    const isOwner = review.touristId.toString() === req.user.sub
    const isAdmin = req.user.roles?.includes("ADMIN")

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" })
    }

    await ReviewModel.findByIdAndDelete(req.params.id)

    return res.status(200).json({ message: "Review deleted successfully" })
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete review" })
  }
}
