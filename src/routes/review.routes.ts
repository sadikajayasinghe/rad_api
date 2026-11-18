import { Router } from "express"
import {
  createReview,
  getActivityReviews,
  deleteReview
} from "../controllers/review.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { UserRole } from "../models/user.model"

const router = Router()

// Public route to view reviews
router.get("/activity/:activityId", getActivityReviews)

// Tourist submit review
router.post(
  "/",
  authenticate,
  requireRole(UserRole.TOURIST, UserRole.ADMIN),
  createReview
)

// Delete review
router.delete("/:id", authenticate, deleteReview)

export default router
