import { Router } from "express"
import { askChatbot } from "../controllers/chatbot.controller"

const router = Router()

// Public endpoint so any visitor or logged-in tourist can ask the bot questions
router.post("/", askChatbot)

export default router
