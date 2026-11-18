import { Router } from "express"
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  downloadBookingTicket
} from "../controllers/booking.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { UserRole } from "../models/user.model"

const router = Router()

// Tourist routes
router.post(
  "/",
  authenticate,
  requireRole(UserRole.TOURIST, UserRole.ADMIN),
  createBooking
)

router.get(
  "/my",
  authenticate,
  requireRole(UserRole.TOURIST, UserRole.ADMIN),
  getMyBookings
)

router.put(
  "/:id/cancel",
  authenticate,
  requireRole(UserRole.TOURIST, UserRole.ADMIN),
  cancelBooking
)

// Provider routes
router.get(
  "/provider",
  authenticate,
  requireRole(UserRole.PROVIDER, UserRole.ADMIN),
  getProviderBookings
)

router.put(
  "/:id/status",
  authenticate,
  requireRole(UserRole.PROVIDER, UserRole.ADMIN),
  updateBookingStatus
)

// Shared / authenticated
router.get("/:id", authenticate, getBookingById)
router.get("/:id/ticket", authenticate, downloadBookingTicket)

export default router
