import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Send, Mic } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

const quickReplies = [
  "Breathing",
  "Affirmation", 
  "Journal Prompt"
]

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function Chat({ onBack }) {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm here to support your mental wellness journey. How are you feeling today? 🌱",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const chatEndRef = useRef(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const messageToSend = currentMessage
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await getAIResponse(messageToSend)
      const responseMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, responseMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. Remember, if you're experiencing a mental health crisis, please reach out to a healthcare professional or crisis helpline.",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getAIResponse = async (message) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const mentalHealthPrompt = `You are a compassionate and supportive mental health companion AI for the Araise wellness app. Your role is to provide emotional support, guidance, and resources while maintaining professional boundaries.

GUIDELINES:
- Be empathetic, non-judgmental, and supportive
- Provide practical coping strategies and wellness tips
- Encourage self-care and healthy habits
- If someone expresses serious mental health concerns, gently suggest professional help
- Keep responses concise but meaningful (2-3 sentences max)
- Use warm, encouraging language
- Never provide medical advice or diagnose conditions
- Focus on wellness, mindfulness, exercise, and positive mental health practices
- Include relevant emojis to make responses feel more personal

CRISIS SITUATIONS:
If someone mentions self-harm, suicide, or severe mental health crisis, respond with immediate care and provide crisis resources.

Current user message: "${message}"

Respond as a caring mental health companion, focusing on the user's emotional wellbeing and providing helpful, supportive guidance.`

      const result = await model.generateContent(mentalHealthPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={onBack}
          className="text-ar-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-hagrid font-light text-ar-white">Wellness Companion</h1>
        </div>
        <button
          onClick={() => setIsVoiceMode(!isVoiceMode)}
          className={`ml-auto p-2 rounded-lg transition-colors ${
            isVoiceMode ? 'bg-purple-600 text-white' : 'bg-ar-gray-800 text-ar-gray-400'
          }`}
        >
          <Mic size={16} />
        </button>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden h-[calc(100vh-200px)] min-h-[500px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 sm:p-6 border-b border-ar-gray-800 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <h3 className="text-lg font-hagrid font-light text-ar-white mb-2">
            Your Safe Space for Mental Wellness
          </h3>
          <p className="text-ar-gray-400 text-sm">
            Share your thoughts, feelings, and life journey. This is a judgment-free zone where your emotional well-being matters most.
          </p>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-ar-gray-800 text-ar-gray-100 border border-ar-gray-700'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex justify-start"
            >
              <div className="bg-ar-gray-800 text-ar-gray-100 border border-ar-gray-700 px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-xs text-ar-gray-400">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 sm:px-6 py-3 border-t border-ar-gray-800">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => setCurrentMessage(reply)}
                className="px-3 py-2 bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-gray-300 text-xs sm:text-sm rounded-full transition-colors border border-ar-gray-700"
              >
                {reply}
              </button>
            ))}
            <button
              onClick={() => setCurrentMessage("I'm feeling overwhelmed today")}
              className="px-3 py-2 bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-gray-300 text-xs sm:text-sm rounded-full transition-colors border border-ar-gray-700"
            >
              Feeling overwhelmed
            </button>
            <button
              onClick={() => setCurrentMessage("I want to share something positive")}
              className="px-3 py-2 bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-gray-300 text-xs sm:text-sm rounded-full transition-colors border border-ar-gray-700"
            >
              Something positive
            </button>
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts, feelings, or what's on your mind..."
              className="flex-1 bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none text-sm sm:text-base"
            />
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              <Send size={14} className="sm:hidden" />
              <Send size={16} className="hidden sm:block" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}