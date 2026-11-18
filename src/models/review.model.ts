
import { Document, model, Schema, Types } from "mongoose"

export interface IReview extends Document {
  touristId: Types.ObjectId
  activityId: Types.ObjectId
  bookingId: Types.ObjectId
  rating: number
  comment: string
}

const reviewSchema = new Schema<IReview>(
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
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "bookings",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

export const ReviewModel = model<IReview>("reviews", reviewSchema)
