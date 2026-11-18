import { NextFunction, Response } from "express"
import { AuthRequest } from "./auth"
import { UserRole } from "../models/user.model"

export const requireRole = (...roles: (UserRole | string)[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userRoles = req.user.roles || []
    const hasRole = roles.some((role) => userRoles.includes(role as any))

    if (!hasRole) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(", ")}` })
    }

    next()
  }
}
