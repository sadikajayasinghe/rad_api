import { Router } from "express"
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getMyActivities
} from "../controllers/activity.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { UserRole } from "../models/user.model"

const router = Router()

// Public routes
router.get("/", getActivities)
router.get("/:id", getActivityById)

// Provider routes
router.get(
  "/provider/my-activities",
  authenticate,
  requireRole(UserRole.PROVIDER, UserRole.ADMIN),
  getMyActivities
)

router.post(
  "/",
  authenticate,
  requireRole(UserRole.PROVIDER, UserRole.ADMIN),
  createActivity
)

router.put(
  "/:id",
  authenticate,
  requireRole(UserRole.PROVIDER, UserRole.ADMIN),
  updateActivity
)

router.delete(
  "/:id",
  authenticate,
  requireRole(UserRole.PROVIDER, UserRole.ADMIN),
  deleteActivity
)

export default router
