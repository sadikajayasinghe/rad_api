import { Request, Response } from "express"
import { chatWithTouristBot } from "../services/chatbot.service"

export const askChatbot = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "A text message is required" })
    }

    const reply = await chatWithTouristBot(message.trim(), Array.isArray(history) ? history : [])

    return res.status(200).json({
      success: true,
      reply
    })
  } catch (error) {
    console.error("Chat Controller Error:", error)
    return res.status(500).json({ message: "Failed to generate chatbot response" })
  }
}
