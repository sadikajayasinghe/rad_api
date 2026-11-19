import { GoogleGenAI } from "@google/genai"
import { ActivityModel } from "../models/activity.model"

interface ChatMessage {
  role: "user" | "model"
  content: string
}

export const chatWithTouristBot = async (
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY

  // If no Gemini API key is configured, provide a helpful fallback assistant
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return getFallbackResponse(userMessage)
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    // Fetch live activities from DB to provide accurate recommendations
    const activities = await ActivityModel.find({ status: "APPROVED" })
      .select("title category location pricePerPerson duration")
      .limit(10)

    const activityContext = activities.length > 0
      ? activities
          .map(
            (a) =>
              `- ${a.title} (${a.category}) in ${a.location}: LKR ${a.pricePerPerson.toLocaleString()} per person (${a.duration})`
          )
          .join("\n")
      : "No live activities currently listed."

    const systemPrompt = `You are 'LankaGuide AI', an enthusiastic, warm, and highly knowledgeable travel concierge for the Sri Lanka Tourist Activity Discovery and Booking Platform.

Your goals:
1. Help tourists explore and plan activities across Sri Lanka (wildlife safaris in Yala/Wilpattu, whale watching in Mirissa/Trincomalee, mountain hiking in Ella/Knuckles, surfing in Arugam Bay/Weligama, cultural tours in Sigiriya/Kandy).
2. Recommend activities available in our database. When recommending, mention the approximate price in LKR, the location, and why it is special.
3. Offer practical Sri Lanka travel tips (monsoon seasons, best months to visit, packing essentials, etiquette at cultural sites).
4. Tone: Welcoming (you can start with 'Ayubowan! 🙏'), professional, friendly, and concise.

Current Available Platform Activities:
${activityContext}

Respond helpfully to the tourist.`

    // Format chat contents
    const contents: any[] = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [
          {
            text: "Ayubowan! 🙏 I am LankaGuide AI, your personal Sri Lanka travel assistant. How can I help you plan your adventure today?"
          }
        ]
      }
    ]

    // Append prior conversation history
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      })
    }

    // Append the new user prompt
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    })

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents
    })

    return (
      response.text?.trim() ||
      "Ayubowan! I am having trouble fetching a response right now. Please explore our activities list directly on the platform!"
    )
  } catch (error: any) {
    console.error("AI Chatbot Error:", error?.message || error)

    // Attempt fallback with alternative model if gemini-2.5-flash fails
    try {
      const ai = new GoogleGenAI({ apiKey })
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are a Sri Lanka tourist guide. Answer this briefly and warmly: ${userMessage}`
      })
      if (fallbackResponse.text) return fallbackResponse.text.trim()
    } catch {
      // Fall through to standard fallback
    }

    return getFallbackResponse(userMessage)
  }
}

// Fallback response when GEMINI_API_KEY is not yet supplied
const getFallbackResponse = (message: string): string => {
  const lower = message.toLowerCase()

  if (lower.includes("safari") || lower.includes("yala") || lower.includes("wildlife")) {
    return "Ayubowan! 🐘 For wildlife, we highly recommend our **Yala National Park Jeep Safari**! You'll have chances to spot leopards, elephants, and sloth bears. Prices start around LKR 12,000 per person. You can book it directly on our Activities page!"
  }

  if (lower.includes("whale") || lower.includes("mirissa") || lower.includes("dolphin")) {
    return "Ayubowan! 🐋 Whale watching in **Mirissa** is an incredible experience to see blue whales and spinner dolphins. The best season is November to April. Price is around LKR 8,000 per person. Check our Whale Watching listing to book!"
  }

  if (lower.includes("hike") || lower.includes("hiking") || lower.includes("ella")) {
    return "Ayubowan! ⛰️ If you love hiking, **Ella Rock and Little Adam's Peak** offer breathtaking mountain views and lush tea plantations. Guided hikes start from LKR 3,500 per person!"
  }

  if (lower.includes("surf") || lower.includes("surfing") || lower.includes("arugam")) {
    return "Ayubowan! 🏄 Arugam Bay is world-famous for right-hand point break surfing (best May–September), and Weligama is perfect for beginners (November–April). Surfing lessons start around LKR 5,000!"
  }

  return (
    "Ayubowan! 🙏 Welcome to Sri Lanka's Tourist Activity Platform! I can help you discover wildlife safaris (Yala), whale watching (Mirissa), mountain hikes (Ella), surfing lessons (Arugam Bay), and more. What kind of adventure are you looking for?"
  )
}
