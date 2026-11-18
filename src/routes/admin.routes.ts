import { Router } from "express"
import {
  getAllUsers,
  updateUserApproval,
  getAllActivitiesAdmin,
  updateActivityStatus,
  getAllBookingsAdmin,
  getDashboardStats
} from "../controllers/admin.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { UserRole } from "../models/user.model"

const router = Router()

// Protect all admin routes
router.use(authenticate, requireRole(UserRole.ADMIN))

router.get("/users", getAllUsers)
router.put("/users/:id/approve", updateUserApproval)

router.get("/activities", getAllActivitiesAdmin)
router.put("/activities/:id/status", updateActivityStatus)

router.get("/bookings", getAllBookingsAdmin)
router.get("/stats", getDashboardStats)

export default router
