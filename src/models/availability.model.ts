import { Document, model, Schema, Types } from "mongoose"

export interface IAvailability extends Document {
  activityId: Types.ObjectId
  date: Date
  startTime?: string
  endTime?: string
  capacity: number
  bookedCount: number
  isAvailable: boolean
}

const availabilitySchema = new Schema<IAvailability>(
  {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: "activities",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export const AvailabilityModel = model<IAvailability>("availabilities", availabilitySchema)
