import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, ArrowLeft, Menu, MessageSquare, Trash2, Sparkles, Heart } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useUserStore } from "../../store/userStore"
import VoiceModal from "./VoiceModal"

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function Chat({ onBack }) {
  const { updateMentalHealthProgress, logChatSession } = useUserStore()

  const handleBack = async () => {
    // Log chat session when user leaves
    const session = chatSessions.find(s => s.id === currentSessionId)
    if (session && session.messages.length > 1) { // More than just the initial AI message
      const userMessages = session.messages.filter(m => m.type === 'user')
      const topics = userMessages.map(m => m.content.substring(0, 50)).slice(0, 3) // First 3 user messages as topics
      const summary = `Chat session with ${userMessages.length} messages`

      await logChatSession(summary, topics)
      await updateMentalHealthProgress(15) // 15% for chat session
    }

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
    <div className="flex h-screen bg-gradient-to-br from-ar-black via-ar-black to-blue-900/20 fixed inset-0 z-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Sidebar - Moved to Right */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            />

            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-ar-black/80 backdrop-blur-xl border-l border-blue-500/20 flex flex-col z-50 md:relative md:w-80"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-400" />
                    Chat History
                  </h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="md:hidden p-1 text-ar-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                <motion.button
                  onClick={startNewChat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600/20 to-blue-500/10 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 text-white py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={16} className="group-hover:text-blue-300 transition-colors" />
                  New Chat
                </motion.button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-2">
                {chatSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group flex items-center justify-between p-3 rounded-xl mb-2 cursor-pointer transition-all duration-300 ${session.id === currentSessionId
                      ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/15 border border-blue-500/40 text-white shadow-lg shadow-blue-500/10'
                      : 'text-ar-gray-300 hover:bg-blue-500/10 hover:border hover:border-blue-500/20 hover:text-white backdrop-blur-sm'
                      }`}
                    onClick={() => {
                      setCurrentSessionId(session.id)
                      setShowSidebar(false)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-ar-gray-400">{session.date}</p>
                    </div>
                    {chatSessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-ar-gray-400 hover:text-red-400 transition-all duration-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-ar-black/40 backdrop-blur-xl border-b border-blue-500/20"
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-ar-gray-300 hover:text-white transition-colors rounded-lg hover:bg-blue-500/10"
            >
              <ArrowLeft size={20} />
            </motion.button>

            <div className="flex items-center gap-3">
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-blue-400/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center relative overflow-hidden">
                  <span className="text-white text-sm font-semibold relative z-10">N</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/15"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-blue-300/15 rounded-full blur-sm"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              <div>
                <h1 className="text-lg font-poppins font-semibold text-white flex items-center gap-2">
                  Nivi
                  <Heart size={14} className="text-pink-400 animate-pulse" />
                </h1>
                <p className="text-xs text-blue-300">Always here to listen</p>
              </div>
            </div>
          </div>

          <motion.button
            onClick={() => setShowSidebar(!showSidebar)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-ar-gray-300 hover:text-white transition-colors rounded-lg hover:bg-blue-500/10"
          >
            <Menu size={20} />
          </motion.button>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto relative">
          {chatMessages.length === 1 ? (
            // Welcome Screen
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center h-full px-6 text-center relative"
            >
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5
                    }}
                  />
                ))}
              </div>

              <motion.div
                className="relative mb-6"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-blue-400/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center relative overflow-hidden">
                  <span className="text-white text-3xl font-semibold relative z-10">N</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/15"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-blue-300/15 rounded-full blur-lg"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-poppins font-semibold text-white mb-3 flex items-center gap-2"
              >
                Always here to listen
                <Heart size={20} className="text-pink-400 animate-pulse" />
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-blue-200/80 max-w-md leading-relaxed"
              >
                I'm Nivi, your wellness companion. Share your thoughts, feelings, or anything that's on your mind. This is a safe space for you.
              </motion.p>


            </motion.div>
          ) : (
            // Chat Messages
            <div className="px-6 py-6 space-y-6 max-w-4xl mx-auto">
              {chatMessages.slice(1).map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden ${message.type === 'ai'
                      ? 'bg-gradient-to-br from-blue-500/30 to-blue-400/20 backdrop-blur-sm border border-blue-400/30'
                      : 'bg-gradient-to-br from-gray-600/50 to-gray-500/50 backdrop-blur-sm border border-gray-400/30'
                      }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white text-sm font-semibold relative z-10">
                      {message.type === 'ai' ? 'N' : 'Y'}
                    </span>
                    {message.type === 'ai' && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-300/8"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Message Content */}
                  <div className="flex-1 max-w-3xl">
                    <motion.div
                      className={`p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border ${message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-400/30 text-white ml-auto max-w-md'
                        : 'bg-gradient-to-br from-gray-800/40 to-gray-700/20 border-gray-600/20 text-gray-100 mr-auto'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.content}
                    </motion.div>
                    <p className={`text-xs text-gray-400 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-blue-400/20 backdrop-blur-sm border border-blue-400/30 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">N</span>
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-gradient-to-br from-gray-800/40 to-gray-700/20 backdrop-blur-sm border border-gray-600/20 rounded-2xl">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 md:p-6 bg-ar-black/40 backdrop-blur-xl border-t border-blue-500/20"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              {/* Voice Button - Outside */}
              <motion.button
                onClick={toggleVoiceMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all flex-shrink-0 backdrop-blur-sm border ${showVoiceModal
                  ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/15 border-blue-400/50 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-800/50 border-gray-600/30 text-gray-300 hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-blue-200'
                  }`}
              >
                <Mic size={18} />
              </motion.button>

              {/* Input with Send Button Inside */}
              <div className="flex-1 relative">
                <motion.input
                  ref={inputRef}
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Message Nivi..."
                  className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-blue-200/50 focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all duration-300"
                  disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                />

                {/* Send Button - Inside Input */}
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!currentMessage.trim() || isLoading}
                  whileHover={currentMessage.trim() && !isLoading ? { scale: 1.1 } : {}}
                  whileTap={currentMessage.trim() && !isLoading ? { scale: 0.9 } : {}}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${currentMessage.trim() && !isLoading
                    ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/25 text-white hover:from-blue-600/60 hover:to-blue-500/40 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>


          </div>
        </motion.div>
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