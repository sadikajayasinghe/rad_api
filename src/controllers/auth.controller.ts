import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { UserModel, UserRole } from "../models/user.model"
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../util/jwt"
import { AuthRequest } from "../middleware/auth"

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Determine assigned role
    const assignedRole =
      role && Object.values(UserRole).includes(role)
        ? (role as UserRole)
        : UserRole.TOURIST

    // Providers might need admin approval; tourists are auto-approved
    const isApproved = assignedRole === UserRole.TOURIST

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: [assignedRole],
      approve: isApproved
    })

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        approve: user.approve
      }
    })
  } catch (error) {
    console.error("Register Error:", error)
    return res.status(500).json({ message: "Failed to register user" })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        approve: user.approve
      }
    })
  } catch (error) {
    console.error("Login Error:", error)
    return res.status(500).json({ message: "Failed to login" })
  }
}

export const getRefreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" })
    }

    const decoded = verifyRefreshToken(refreshToken)
    const user = await UserModel.findById(decoded.sub)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const newAccessToken = signAccessToken(user)
    const newRefreshToken = signRefreshToken(user)

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" })
  }
}

export const getMyDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await UserModel.findById(req.user.sub).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user details" })
  }
}
