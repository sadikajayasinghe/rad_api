
import { Document, model, Schema, Types } from "mongoose"

export interface IBooking extends Document {
  touristId: Types.ObjectId
  activityId: Types.ObjectId
  bookingDate: Date
  participants: number
  totalPrice: number
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED"
}

const bookingSchema = new Schema<IBooking>(
  {
    touristId: {
      type: Schema.Types.ObjectId,
      ref: "system_users",
      required: true
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "activities",
      required: true
    },
    bookingDate: {
      type: Date,
      required: true
    },
    participants: {
      type: Number,
      required: true,
      min: 1
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
)

export const BookingModel = model<IBooking>("bookings", bookingSchema)
