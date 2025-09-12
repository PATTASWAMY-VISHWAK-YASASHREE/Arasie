import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Send, Mic } from "lucide-react"

const quickReplies = [
  "Breathing",
  "Affirmation", 
  "Journal Prompt"
]

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
    setCurrentMessage('')

    // Simulate AI response (in real app, this would be an API call)
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: getAIResponse(currentMessage),
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const getAIResponse = (message) => {
    const responses = [
      "I understand how you're feeling. Remember that it's okay to have difficult moments. What small step can you take right now to care for yourself?",
      "Thank you for sharing that with me. Your feelings are valid. Have you tried any breathing exercises or mindfulness techniques today?",
      "It sounds like you're going through a challenging time. Sometimes taking a few deep breaths can help us feel more centered. Would you like to try a breathing exercise together?",
      "I'm here to listen and support you. Remember that seeking help is a sign of strength, not weakness. What brings you comfort during difficult times?",
      "Your mental health journey is unique to you. Small, consistent steps often lead to meaningful change. How can we work together to support your wellbeing today?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
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