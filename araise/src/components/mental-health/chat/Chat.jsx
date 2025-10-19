import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, ArrowLeft, Menu, MessageSquare, Trash2, Sparkles, Heart, Volume2, VolumeX } from "lucide-react"
import { useUserStore } from "../../../store/userStore"
import { useAuth } from "../../../contexts/AuthContext"
import VoiceModal from "./VoiceModal"

// API Base URL
const API_BASE_URL = "https://mental-health-agent-0oib.onrender.com"

export default function Chat({ onBack }) {
  const { updateMentalHealthProgress, logChatSession } = useUserStore()
  const { currentUser } = useAuth()

  const handleBack = async () => {
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    // Log chat session when user leaves
    const session = chatSessions.find(s => s.session_id === currentSessionId)
    if (session && session.messages.length > 0) {
      const userMessages = session.messages.filter(m => m.role === 'user')
      const topics = userMessages.map(m => m.content.substring(0, 50)).slice(0, 3)
      const summary = `Chat session with ${userMessages.length} messages`

      await logChatSession(summary, topics)
      await updateMentalHealthProgress(15)
    }

    onBack()
  }

  const [chatSessions, setChatSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false) // Auto-speak AI responses
  const [isSpeaking, setIsSpeaking] = useState(false)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const speechSynthRef = useRef(null)

  const currentSession = chatSessions.find(session => session.session_id === currentSessionId)
  const chatMessages = currentSession?.messages || []

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis
    }

    return () => {
      // Cleanup: stop any ongoing speech
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel()
      }
    }
  }, [])

  // Function to speak text
  const speakText = (text) => {
    if (!speechSynthRef.current || !text) return

    try {
      // Cancel any ongoing speech
      speechSynthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set voice properties for a warm, friendly female voice
      utterance.rate = 0.95 // Slightly slower for better comprehension
      utterance.pitch = 1.1 // Slightly higher pitch for warmth
      utterance.volume = 1.0
      
      // Try to get a female voice
      const voices = speechSynthRef.current.getVoices()
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Microsoft Zira')
      )
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      speechSynthRef.current.speak(utterance)
    } catch (error) {
      console.error('Error in text-to-speech:', error)
      setIsSpeaking(false)
    }
  }

  // Function to stop speaking
  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Load chat sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      if (!currentUser?.uid) return

      try {
        const response = await fetch(`${API_BASE_URL}/sessions/${currentUser.uid}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch sessions')
        }

        const data = await response.json()
        console.log('Sessions API response:', data)
        
        if (data.success && data.sessions && data.sessions.length > 0) {
          // Transform the sessions to match our structure
          const transformedSessions = data.sessions.map(session => {
            // Each message in the API has both query (user) and response (assistant)
            const messages = []
            session.messages.forEach(msg => {
              // Add user message
              if (msg.query) {
                messages.push({
                  role: 'user',
                  content: msg.query,
                  timestamp: msg.timestamp
                })
              }
              // Add assistant message
              if (msg.response) {
                messages.push({
                  role: 'assistant',
                  content: msg.response,
                  timestamp: msg.timestamp
                })
              }
            })
            
            return {
              session_id: session.session_id,
              title: session.messages[0]?.query?.substring(0, 50) || 'Chat Session',
              created_at: session.created_at,
              messages: messages
            }
          })
          
          setChatSessions(transformedSessions)
          // Set the first session as current
          setCurrentSessionId(transformedSessions[0].session_id)
        }
      } catch (error) {
        console.error('Error fetching sessions:', error)
      }
    }

    fetchSessions()
  }, [currentUser])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSessionId, chatSessions])

  const handleSendMessage = async (messageText = currentMessage) => {
    if (!messageText.trim() || !currentUser?.uid) return

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }

    // If it's a new chat, create a session entry first
    if (!currentSessionId) {
      const newSession = {
        session_id: null,
        title: messageText.substring(0, 50),
        created_at: new Date().toISOString(),
        messages: [userMessage]
      }
      setChatSessions(prev => [newSession, ...prev])
    } else {
      // Update existing session with new message
      setChatSessions(prev => prev.map(session =>
        session.session_id === currentSessionId
          ? { ...session, messages: [...session.messages, userMessage] }
          : session
      ))
    }

    setCurrentMessage('')
    setIsLoading(true)

    // Focus input after sending
    setTimeout(() => inputRef.current?.focus(), 100)

    try {
      // Prepare URL with query parameters
      const url = new URL(`${API_BASE_URL}/query/${currentUser.uid}`)
      url.searchParams.append('query', messageText)
      
      // Add session_id only if we have an existing session
      if (currentSessionId) {
        url.searchParams.append('session_id', currentSessionId)
      }

      console.log('Sending request to:', url.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (!data.success) {
        throw new Error('API returned unsuccessful response')
      }

      const aiMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString()
      }

      // Update session with AI response and session_id
      if (!currentSessionId) {
        // For new chats, update the first session
        setChatSessions(prev => prev.map((session, index) => {
          if (index === 0 && session.session_id === null) {
            return {
              ...session,
              session_id: data.session_id,
              messages: [...session.messages, aiMessage]
            }
          }
          return session
        }))
        setCurrentSessionId(data.session_id)
      } else {
        // For existing chats, update the matching session
        setChatSessions(prev => prev.map(session => {
          if (session.session_id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, aiMessage]
            }
          }
          return session
        }))
      }

      // Speak the AI response
      if (showVoiceModal && window.voiceModalSpeakText) {
        // Use voice modal's speech synthesis
        setTimeout(() => window.voiceModalSpeakText(data.response), 500)
      } else if (autoSpeak) {
        // Use regular text-to-speech if auto-speak is enabled
        setTimeout(() => speakText(data.response), 500)
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment. Remember, if you're experiencing a mental health crisis, please reach out to a healthcare professional or crisis helpline.",
        timestamp: new Date().toISOString()
      }
      
      if (!currentSessionId) {
        setChatSessions(prev => prev.map((session, index) => {
          if (index === 0) {
            return { ...session, messages: [...session.messages, errorMessage] }
          }
          return session
        }))
      } else {
        setChatSessions(prev => prev.map(session =>
          session.session_id === currentSessionId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        ))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    const newSession = {
      session_id: null, // Will be set when first message is sent
      title: `New Chat`,
      created_at: new Date().toISOString(),
      messages: []
    }
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(null)
    setShowSidebar(false)
  }

  const deleteChat = (sessionId) => {
    setChatSessions(prev => prev.filter(session => session.session_id !== sessionId))
    if (sessionId === currentSessionId && chatSessions.length > 1) {
      const remainingSessions = chatSessions.filter(session => session.session_id !== sessionId)
      setCurrentSessionId(remainingSessions[0].session_id)
    }
  }

  const toggleVoiceMode = () => {
    setShowVoiceModal(!showVoiceModal)
  }

  const handleVoiceModalClose = () => {
    setShowVoiceModal(false)
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
                {chatSessions.length === 0 ? (
                  <div className="text-center text-ar-gray-400 text-sm mt-8">
                    No chat history yet
                  </div>
                ) : (
                  chatSessions.map((session, index) => (
                    <motion.div
                      key={session.session_id || `new-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group flex items-center justify-between p-3 rounded-xl mb-2 cursor-pointer transition-all duration-300 ${session.session_id === currentSessionId
                        ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/15 border border-blue-500/40 text-white shadow-lg shadow-blue-500/10'
                        : 'text-ar-gray-300 hover:bg-blue-500/10 hover:border hover:border-blue-500/20 hover:text-white backdrop-blur-sm'
                        }`}
                      onClick={() => {
                        setCurrentSessionId(session.session_id)
                        setShowSidebar(false)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {session.title || 'New Chat'}
                        </p>
                        <p className="text-xs text-ar-gray-400">
                          {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                      {chatSessions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(session.session_id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-ar-gray-400 hover:text-red-400 transition-all duration-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
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
              className="w-12 h-12 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300 flex items-center justify-center"
            >
              <ArrowLeft size={20} className="text-ar-blue" />
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
                <h1 className="text-lg font-poppins font-semibold text-white">
                  Nivi
                </h1>
                <p className="text-xs text-blue-300">
                  {isSpeaking ? (
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                      Speaking...
                    </span>
                  ) : (
                    'Always here to listen'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-speak toggle */}
            <motion.button
              onClick={() => {
                setAutoSpeak(!autoSpeak)
                if (autoSpeak) {
                  stopSpeaking()
                }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-lg transition-all ${
                autoSpeak
                  ? 'text-blue-400 bg-blue-500/20 border border-blue-400/30'
                  : 'text-ar-gray-300 hover:text-white hover:bg-blue-500/10'
              }`}
              title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
            >
              {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>

            {/* Menu button */}
            <motion.button
              onClick={() => setShowSidebar(!showSidebar)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-ar-gray-300 hover:text-white transition-colors rounded-lg hover:bg-blue-500/10"
            >
              <Menu size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto relative">
          {chatMessages.length === 0 ? (
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
                className="text-3xl font-poppins font-semibold text-white mb-3"
              >
                Always here to listen
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
              {chatMessages.map((message, index) => (
                <motion.div
                  key={`${message.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden ${message.role === 'assistant'
                      ? 'bg-gradient-to-br from-blue-500/30 to-blue-400/20 backdrop-blur-sm border border-blue-400/30'
                      : 'bg-gradient-to-br from-gray-600/50 to-gray-500/50 backdrop-blur-sm border border-gray-400/30'
                      }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white text-sm font-semibold relative z-10">
                      {message.role === 'assistant' ? 'N' : 'Y'}
                    </span>
                    {message.role === 'assistant' && (
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
                      className={`p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border ${message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-400/30 text-white ml-auto max-w-md'
                        : 'bg-gradient-to-br from-gray-800/40 to-gray-700/20 border-gray-600/20 text-gray-100 mr-auto'
                        }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {message.content}
                    </motion.div>
                    <div className={`flex items-center gap-2 mt-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <p className="text-xs text-gray-400">
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                      {/* Speaker button for AI messages */}
                      {message.role === 'assistant' && (
                        <motion.button
                          onClick={() => speakText(message.content)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 rounded-md text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Listen to this message"
                        >
                          <Volume2 size={14} />
                        </motion.button>
                      )}
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