import { Response } from "express"
import { AuthRequest } from "../middleware/auth"
import { BookingModel } from "../models/booking.model"
import { ActivityModel } from "../models/activity.model"
import { UserModel, UserRole } from "../models/user.model"
import { generateBookingPDF } from "../services/pdf.service"

// 1. Create a booking (Tourists)
export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { activityId, bookingDate, participants } = req.body

    if (!activityId || !bookingDate || !participants) {
      return res.status(400).json({ message: "activityId, bookingDate, and participants are required" })
    }

    if (Number(participants) < 1) {
      return res.status(400).json({ message: "Participants must be at least 1" })
    }

    const activity = await ActivityModel.findById(activityId)
    if (!activity || activity.status !== "APPROVED") {
      return res.status(404).json({ message: "Activity not found or not currently available" })
    }

    if (activity.maxParticipants && Number(participants) > activity.maxParticipants) {
      return res.status(400).json({
        message: `Exceeded maximum participants limit of ${activity.maxParticipants}`
      })
    }

    const totalPrice = activity.pricePerPerson * Number(participants)

    const booking = await BookingModel.create({
      touristId: req.user.sub,
      activityId,
      bookingDate: new Date(bookingDate),
      participants: Number(participants),
      totalPrice,
      status: "PENDING"
    })

    return res.status(201).json({
      message: "Booking submitted successfully",
      booking
    })
  } catch (error) {
    console.error("Create Booking Error:", error)
    return res.status(500).json({ message: "Failed to create booking" })
  }
}

// 2. Get bookings of current tourist
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const bookings = await BookingModel.find({ touristId: req.user.sub })
      .populate("activityId")
      .sort({ createdAt: -1 })

    return res.status(200).json({ count: bookings.length, bookings })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your bookings" })
  }
}

// 3. Get bookings for activities owned by the provider
export const getProviderBookings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // Find all activities owned by this provider
    const activities = await ActivityModel.find({ providerId: req.user.sub }).select("_id")
    const activityIds = activities.map((a) => a._id)

    const bookings = await BookingModel.find({ activityId: { $in: activityIds } })
      .populate("activityId")
      .populate("touristId", "name email")
      .sort({ createdAt: -1 })

    return res.status(200).json({ count: bookings.length, bookings })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch provider bookings" })
  }
}

// 4. Get booking by ID
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const booking = await BookingModel.findById(req.params.id)
      .populate("activityId")
      .populate("touristId", "name email")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    return res.status(200).json({ booking })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch booking" })
  }
}

// 5. Update booking status (Provider or Admin)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { status } = req.body
    const validStatuses = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` })
    }

    const booking = await BookingModel.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    booking.status = status
    await booking.save()

    return res.status(200).json({
      message: `Booking status updated to ${status}`,
      booking
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to update booking status" })
  }
}

// 6. Cancel booking (Tourist)
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const booking = await BookingModel.findOne({
      _id: req.params.id,
      touristId: req.user.sub
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not authorized" })
    }

    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return res.status(400).json({ message: `Cannot cancel booking with status: ${booking.status}` })
    }

    booking.status = "CANCELLED"
    await booking.save()

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel booking" })
  }
}

// 7. Download PDF Ticket / Confirmation
export const downloadBookingTicket = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const booking = await BookingModel.findById(req.params.id)
      .populate<{ touristId: { name: string; email: string } }>("touristId", "name email")
      .populate<{ activityId: { title: string; category: string; location: string; pricePerPerson: number } }>(
        "activityId",
        "title category location pricePerPerson"
      )

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Generate PDF ticket
    generateBookingPDF(
      {
        bookingId: booking._id.toString(),
        touristName: (booking.touristId as any)?.name || "Guest",
        touristEmail: (booking.touristId as any)?.email || "N/A",
        activityTitle: (booking.activityId as any)?.title || "Tourist Activity",
        category: (booking.activityId as any)?.category || "General",
        location: (booking.activityId as any)?.location || "Sri Lanka",
        bookingDate: new Date(booking.bookingDate).toLocaleDateString(),
        participants: booking.participants,
        pricePerPerson: (booking.activityId as any)?.pricePerPerson || 0,
        totalPrice: booking.totalPrice,
        status: booking.status
      },
      res
    )
  } catch (error) {
    console.error("PDF Download Error:", error)
    return res.status(500).json({ message: "Failed to generate booking ticket" })
  }
}
