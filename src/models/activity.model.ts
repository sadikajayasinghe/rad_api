
import { Document, model, Schema, Types } from "mongoose"

export interface IActivity extends Document {
  title: string
  description: string
  category: string
  location: string
  pricePerPerson: number
  duration: string
  maxParticipants: number
  images: string[]
  providerId: Types.ObjectId
  status: "PENDING" | "APPROVED" | "REJECTED"
}

const activitySchema = new Schema<IActivity>(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    pricePerPerson: {
      type: Number,
      required: true,
      min: 0
    },

    duration: {
      type: String,
      required: true
    },

    maxParticipants: {
      type: Number,
      required: true,
      min: 1
    },

    images: {
      type: [String],
      default: []
    },

    providerId: {
      type: Schema.Types.ObjectId,
      ref: "system_users",
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
)

export const ActivityModel = model<IActivity>(
  "activities",
  activitySchema
)
