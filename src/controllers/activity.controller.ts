
import { Request, Response } from "express"
import { ActivityModel } from "../models/activity.model"
import { AuthRequest } from "../middleware/auth"

const isAdmin = (req: AuthRequest) =>
  req.user?.roles?.includes("ADMIN")


export const createActivity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const activity = await ActivityModel.create({
      ...req.body,
      providerId: req.user.sub
    })

    return res.status(201).json({
      message: "Activity created successfully",
      activity
    })

  } catch (error) {
    return res.status(500).json({ message: "Failed to create activity" })
  }
}

// 2. Get all approved activities with optional filtering
export const getActivities = async (req: Request, res: Response) => {
  try {
    const { category, location, search, minPrice, maxPrice } = req.query
    const filter: any = { status: "APPROVED" }

    if (category) {
      filter.category = new RegExp(String(category), "i")
    }

    if (location) {
      filter.location = new RegExp(String(location), "i")
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(String(search), "i") },
        { description: new RegExp(String(search), "i") },
        { location: new RegExp(String(search), "i") },
        { category: new RegExp(String(search), "i") }
      ]
    }

    if (minPrice || maxPrice) {
      filter.pricePerPerson = {}
      if (minPrice) filter.pricePerPerson.$gte = Number(minPrice)
      if (maxPrice) filter.pricePerPerson.$lte = Number(maxPrice)
    }

    const activities = await ActivityModel.find(filter).populate("providerId", "name email")

    return res.status(200).json({ count: activities.length, activities })
  } catch (error) {
    return res.status(500).json({ message: "Failed to get activities" })
  }
}

// 3. Get activity by ID
export const getActivityById = async (req: Request, res: Response) => {
  try {
    const activity = await ActivityModel.findOne({
      _id: req.params.id,
      status: "APPROVED"
    })

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    return res.status(200).json({ activity })
  } catch (error) {
    return res.status(500).json({ message: "Failed to get activity" })
  }
}

// 4. Update activity
export const updateActivity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const activity = await ActivityModel.findById(req.params.id)

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    const isOwner = activity.providerId.toString() === req.user.sub

    if (!isOwner && !isAdmin(req)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    return res.status(200).json({
      message: "Activity updated successfully",
      activity: updatedActivity
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to update activity" })
  }
}

// 5. Delete activity
export const deleteActivity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const activity = await ActivityModel.findById(req.params.id)

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    const isOwner = activity.providerId.toString() === req.user.sub

    if (!isOwner && !isAdmin(req)) {
      return res.status(403).json({ message: "Access denied" })
    }

    await ActivityModel.findByIdAndDelete(req.params.id)

    return res.status(200).json({
      message: "Activity deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete activity" })
  }
}

// 6. Get provider's own activities
export const getMyActivities = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const activities = await ActivityModel.find({ providerId: req.user.sub })
    return res.status(200).json({ activities })
  } catch (error) {
    return res.status(500).json({ message: "Failed to get provider activities" })
  }
}

