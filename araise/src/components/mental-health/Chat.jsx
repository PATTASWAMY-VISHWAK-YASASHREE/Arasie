import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, ArrowLeft, Menu, MessageSquare, Trash2 } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useUserStore } from "../../store/userStore"
import VoiceModal from "./VoiceModal"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function Chat({ onBack }) {
  const handleBack = () => {
    onBack()
  }
  const [chatSessions, setChatSessions] = useState([
    {
      id: 1,
      title: "Today's Chat",
      date: new Date().toISOString().slice(0, 10),
      messages: [
        {
          id: 1,
          type: 'ai',
          content: "Hello! I'm Nivi, your wellness companion. I'm always here to listen. How are you feeling today?",
          timestamp: new Date()
        }
      ]
    }
  ])
  const [currentSessionId, setCurrentSessionId] = useState(1)
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentSession = chatSessions.find(session => session.id === currentSessionId)
  const chatMessages = currentSession?.messages || []

  // Chat state is managed by parent component (MentalHealth)

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Chat state is managed by parent component (MentalHealth)

  const handleSendMessage = async (messageText = currentMessage) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    // Update current session with new message
    setChatSessions(prev => prev.map(session =>
      session.id === currentSessionId
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ))

    setCurrentMessage('')
    setIsLoading(true)

    // Focus input after sending
    setTimeout(() => inputRef.current?.focus(), 100)

    try {
      const aiResponse = await getAIResponse(messageText)
      const responseMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setChatSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, responseMessage] }
          : session
      ))

      // Speak the AI response if voice modal is open
      if (showVoiceModal && window.voiceModalSpeakText) {
        setTimeout(() => window.voiceModalSpeakText(aiResponse), 500)
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. Remember, if you're experiencing a mental health crisis, please reach out to a healthcare professional or crisis helpline.",
        timestamp: new Date()
      }
      setChatSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    const newSession = {
      id: Date.now(),
      title: `Chat ${chatSessions.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      messages: [
        {
          id: Date.now(),
          type: 'ai',
          content: "Hello! I'm Nivi, your wellness companion. I'm always here to listen. How are you feeling today?",
          timestamp: new Date()
        }
      ]
    }
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setShowSidebar(false)
  }

  const deleteChat = (sessionId) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId))
    if (sessionId === currentSessionId && chatSessions.length > 1) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId)
      setCurrentSessionId(remainingSessions[0].id)
    }
  }

  const toggleVoiceMode = () => {
    setShowVoiceModal(!showVoiceModal)
  }

  const handleVoiceModalClose = () => {
    setShowVoiceModal(false)
  }

  const getAIResponse = async (message) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const mentalHealthPrompt = `You are Nivi, a compassionate and supportive mental health companion AI for the Araise wellness app. Your name is Nivi and you're always here to listen. Your role is to provide emotional support, guidance, and resources while maintaining professional boundaries.

GUIDELINES:
- Be empathetic, non-judgmental, and supportive
- Provide practical coping strategies and wellness tips
- Encourage self-care and healthy habits
- If someone expresses serious mental health concerns, gently suggest professional help
- Keep responses concise but meaningful (2-3 sentences max)
- Use warm, encouraging language
- Never provide medical advice or diagnose conditions
- Focus on wellness, mindfulness, exercise, and positive mental health practices
- You are Nivi, always here to listen

CRISIS SITUATIONS:
If someone mentions self-harm, suicide, or severe mental health crisis, respond with immediate care and provide crisis resources.

Current user message: "${message}"

Respond as Nivi, a caring mental health companion who is always here to listen, focusing on the user's emotional wellbeing and providing helpful, supportive guidance.`

      const result = await model.generateContent(mentalHealthPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }

  return (
    <div className="flex h-screen bg-ar-black fixed inset-0 z-50">
      {/* Sidebar - Moved to Right */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            />

            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-ar-gray-900 border-l border-ar-gray-800 flex flex-col z-50 md:relative md:w-80"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-ar-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-ar-white font-medium">Chat History</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="md:hidden p-1 text-ar-gray-400 hover:text-ar-white"
                  >
                    ×
                  </button>
                </div>
                <button
                  onClick={startNewChat}
                  className="w-full bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  New Chat
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-colors ${session.id === currentSessionId
                      ? 'bg-ar-gray-800 text-ar-white'
                      : 'text-ar-gray-400 hover:bg-ar-gray-800/50 hover:text-ar-white'
                      }`}
                    onClick={() => {
                      setCurrentSessionId(session.id)
                      setShowSidebar(false)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-ar-gray-500">{session.date}</p>
                    </div>
                    {chatSessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-ar-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ar-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 text-ar-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-ar-gray-700 rounded-full flex items-center justify-center">
                <span className="text-ar-gray-300 text-sm font-semibold">N</span>
              </div>
              <div>
                <h1 className="text-lg font-poppins font-semibold text-ar-white">Nivi</h1>
                <p className="text-xs text-ar-gray-400">Always here to listen</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-ar-gray-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {chatMessages.length === 1 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 bg-ar-gray-700 rounded-full flex items-center justify-center mb-4">
                <span className="text-ar-gray-300 text-2xl font-semibold">N</span>
              </div>
              <h2 className="text-2xl font-poppins font-semibold text-ar-white mb-2">
                Always here to listen
              </h2>
              <p className="text-ar-gray-400 max-w-md">
                I'm Nivi, your wellness companion. Share your thoughts, feelings, or anything that's on your mind. This is a safe space for you.
              </p>
            </div>
          ) : (
            // Chat Messages
            <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
              {chatMessages.slice(1).map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'ai'
                    ? 'bg-ar-gray-700'
                    : 'bg-ar-gray-600'
                    }`}>
                    <span className="text-ar-gray-300 text-sm font-semibold">
                      {message.type === 'ai' ? 'N' : 'Y'}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 max-w-3xl">
                    <div className={`text-sm leading-relaxed ${message.type === 'user'
                      ? 'text-ar-white text-right'
                      : 'text-ar-gray-100 text-left'
                      }`}>
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 bg-ar-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-ar-gray-300 text-sm font-semibold">N</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-ar-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-ar-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-ar-gray-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-ar-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              {/* Voice Button - Outside */}
              <button
                onClick={toggleVoiceMode}
                className={`p-3 rounded-xl transition-all flex-shrink-0 ${showVoiceModal
                  ? 'bg-ar-blue text-white'
                  : 'bg-ar-gray-800 text-ar-gray-400 hover:bg-ar-gray-700 hover:text-ar-gray-300'
                  }`}
              >
                <Mic size={18} />
              </button>

              {/* Input with Send Button Inside */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Message Nivi..."
                  className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 pr-12 text-ar-white placeholder-ar-gray-400 focus:border-ar-gray-600 focus:outline-none text-sm"
                  disabled={isLoading}
                />

                {/* Send Button - Inside Input */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim() || isLoading}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${currentMessage.trim() && !isLoading
                    ? 'bg-ar-gray-600 text-ar-white hover:bg-ar-gray-500'
                    : 'bg-ar-gray-800 text-ar-gray-500 cursor-not-allowed'
                    }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Modal Component */}
      <VoiceModal
        isOpen={showVoiceModal}
        onClose={handleVoiceModalClose}
        onMessageSend={handleSendMessage}
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
      />
    </div>
  )
}