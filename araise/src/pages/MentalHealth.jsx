import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageCircle, 
  Wind, 
  Music, 
  BookOpen, 
  Send, 
  Play, 
  Pause, 
  Calendar,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from "lucide-react"
import { useUserStore } from "../store/userStore"

// Mood options with emojis and colors
const moodOptions = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'text-yellow-400' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'text-blue-400' },
  { id: 'stressed', emoji: '😰', label: 'Stressed', color: 'text-orange-400' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'text-purple-400' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: 'text-red-400' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'text-gray-400' },
]

// Meditation categories
const meditationCategories = [
  { id: 'stress-relief', title: 'Stress Relief', icon: Wind, duration: '10 min', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'focus-boost', title: 'Focus Boost', icon: Zap, duration: '15 min', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'sleep-aid', title: 'Sleep Aid', icon: Moon, duration: '20 min', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 'morning-energy', title: 'Morning Energy', icon: Sun, duration: '8 min', color: 'bg-orange-500/20 text-orange-400' },
]

// Sound healing options
const soundOptions = [
  { id: 'rain', title: 'Rain', description: 'Gentle rainfall sounds' },
  { id: 'ocean', title: 'Ocean', description: 'Calming ocean waves' },
  { id: 'white-noise', title: 'White Noise', description: 'Pure white noise' },
  { id: 'tibetan-bowls', title: 'Tibetan Bowls', description: 'Healing bowl sounds' },
  { id: 'forest', title: 'Forest', description: 'Nature forest ambience' },
]

// Breathing exercises
const breathingExercises = [
  { id: '4-7-8', title: '4-7-8 Breathing', description: 'Inhale 4, Hold 7, Exhale 8', pattern: [4, 7, 8] },
  { id: 'box', title: 'Box Breathing', description: 'Equal counts for all phases', pattern: [4, 4, 4, 4] },
  { id: 'triangle', title: 'Triangle Breathing', description: 'Simple 3-phase breathing', pattern: [4, 4, 4] },
]

export default function MentalHealth() {
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedMood, setSelectedMood] = useState(null)
  const [journalNote, setJournalNote] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm here to support your mental wellness journey. How are you feeling today?",
      timestamp: new Date()
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState(0)
  const [breathingExercise, setBreathingExercise] = useState(breathingExercises[0])
  const [playingSound, setPlayingSound] = useState(null)
  const [meditationTimer, setMeditationTimer] = useState(null)
  const [meditationTime, setMeditationTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  
  const chatEndRef = useRef(null)
  const { name, updateMentalHealthProgress } = useUserStore()

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Breathing animation timer
  useEffect(() => {
    if (isBreathing) {
      const pattern = breathingExercise.pattern
      const totalCycles = pattern.reduce((sum, time) => sum + time, 0)
      let currentTime = 0
      
      const interval = setInterval(() => {
        currentTime++
        let phase = 0
        let accumulatedTime = 0
        
        for (let i = 0; i < pattern.length; i++) {
          accumulatedTime += pattern[i]
          if (currentTime <= accumulatedTime) {
            phase = i
            break
          }
        }
        
        setBreathingPhase(phase)
        
        if (currentTime >= totalCycles) {
          currentTime = 0
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isBreathing, breathingExercise])

  // Meditation timer
  useEffect(() => {
    if (isTimerRunning && meditationTimer > 0) {
      const interval = setInterval(() => {
        setMeditationTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isTimerRunning, meditationTimer])

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

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood)
    updateMentalHealthProgress(25) // Update progress in store
  }

  const handleJournalSave = () => {
    if (journalNote.trim()) {
      // Save journal entry (in real app, this would save to database)
      updateMentalHealthProgress(50)
      setJournalNote('')
      alert('Journal entry saved!')
    }
  }

  const startMeditation = (category) => {
    const duration = parseInt(category.duration) * 60 // Convert to seconds
    setMeditationTimer(duration)
    setMeditationTime(duration)
    setIsTimerRunning(true)
    updateMentalHealthProgress(75)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getBreathingInstruction = () => {
    const instructions = ['Inhale', 'Hold', 'Exhale', 'Rest']
    return instructions[breathingPhase] || 'Breathe'
  }

  if (activeSection === 'chat') {
    return (
      <div className="max-w-4xl mx-auto pt-6 h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Mental Health Companion</h1>
        </motion.div>

        <div className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-ar-gray-800 text-ar-gray-100'
                    }`}
                  >
                    <p className="text-sm font-hagrid font-light">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-ar-gray-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Share your thoughts..."
                className="flex-1 bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === 'meditation') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Meditation</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meditationCategories.map((category) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                onClick={() => startMeditation(category)}
              >
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">{category.title}</h3>
                <p className="text-ar-gray-400 text-sm mb-4">Duration: {category.duration}</p>
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-colors">
                  Start Meditation
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Meditation Timer */}
        <AnimatePresence>
          {isTimerRunning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <div className="glass-card p-8 rounded-2xl text-center max-w-md">
                <h3 className="text-2xl font-hagrid font-light text-ar-white mb-4">Meditation in Progress</h3>
                <div className="text-6xl font-light text-purple-400 mb-6">
                  {formatTime(meditationTime)}
                </div>
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (activeSection === 'breathing') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Breathing Exercises</h1>
        </motion.div>

        <div className="glass-card p-8 rounded-2xl text-center">
          {!isBreathing ? (
            <div>
              <h2 className="text-2xl font-hagrid font-light text-ar-white mb-6">Choose a Breathing Exercise</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {breathingExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setBreathingExercise(exercise)}
                    className={`p-4 rounded-xl transition-colors ${
                      breathingExercise.id === exercise.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                    }`}
                  >
                    <h3 className="font-hagrid font-light mb-2">{exercise.title}</h3>
                    <p className="text-sm">{exercise.description}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsBreathing(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Start {breathingExercise.title}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-hagrid font-light text-ar-white mb-8">{breathingExercise.title}</h2>
              
              {/* Breathing Animation Circle */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <motion.div
                  className="w-full h-full border-4 border-purple-400 rounded-full flex items-center justify-center"
                  animate={{
                    scale: breathingPhase === 0 ? [1, 1.3] : breathingPhase === 2 ? [1.3, 1] : [1.3, 1.3],
                  }}
                  transition={{
                    duration: breathingExercise.pattern[breathingPhase] || 4,
                    ease: "easeInOut",
                    repeat: 0,
                  }}
                >
                  <div className="text-2xl font-hagrid font-light text-purple-400">
                    {getBreathingInstruction()}
                  </div>
                </motion.div>
              </div>

              <button
                onClick={() => setIsBreathing(false)}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Stop Exercise
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (activeSection === 'sounds') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Sound Healing</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soundOptions.map((sound) => (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-hagrid font-light text-ar-white">{sound.title}</h3>
                <button
                  onClick={() => setPlayingSound(playingSound === sound.id ? null : sound.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    playingSound === sound.id
                      ? 'bg-red-600 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {playingSound === sound.id ? <Pause size={18} /> : <Play size={18} />}
                </button>
              </div>
              <p className="text-ar-gray-400 text-sm">{sound.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (activeSection === 'journal') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Journal & Mood Tracker</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Mood Selector */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">How are you feeling today?</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelection(mood)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedMood?.id === mood.id
                      ? 'bg-purple-600 scale-105'
                      : 'bg-ar-gray-800 hover:bg-ar-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{mood.emoji}</div>
                  <div className={`text-sm font-hagrid font-light ${mood.color}`}>
                    {mood.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Entry */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">Write how you feel...</h2>
            <textarea
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              placeholder="Take a moment to reflect on your day, your thoughts, and your feelings..."
              className="w-full h-40 bg-ar-gray-800 border border-ar-gray-700 rounded-xl p-4 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none"
            />
            <button
              onClick={handleJournalSave}
              className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-hagrid font-light text-ar-white mb-2">Your Safe Space</h1>
        <p className="text-ar-gray-400 text-lg font-hagrid font-light">for mental clarity and wellness</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chat with Companion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('chat')}
        >
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Chat with Companion 🤝</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Talk to your AI wellness companion for support and guidance</p>
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-colors">
            Start Chat
          </button>
        </motion.div>

        {/* Meditations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('meditation')}
        >
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Heart size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Meditations 🧘</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Guided meditations for stress relief, focus, and sleep</p>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors">
            Start Meditation
          </button>
        </motion.div>

        {/* Breathing Exercises */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('breathing')}
        >
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <Wind size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Breathing Exercises 🌬️</h3>
          <p className="text-ar-gray-400 text-sm mb-4">4-7-8, box breathing, and more calming techniques</p>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl transition-colors">
            Start Breathing
          </button>
        </motion.div>

        {/* Sound Healing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('sounds')}
        >
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
            <Music size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Sound Healing 🎶</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Calming sounds for sleep and relaxation</p>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-colors">
            Play Sounds
          </button>
        </motion.div>

        {/* Journal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('journal')}
        >
          <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Journal 📖</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Daily journaling and mood tracking</p>
          <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl transition-colors">
            Write Entry
          </button>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-2xl"
        >
          <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center mb-4">
            <Calendar size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Your Progress</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Track your mental wellness journey</p>
          <div className="w-full bg-ar-gray-800 rounded-full h-3 mb-2">
            <div className="bg-yellow-400 h-3 rounded-full transition-all duration-500" style={{ width: '65%' }} />
          </div>
          <p className="text-yellow-400 text-sm font-medium">65% Weekly Goal</p>
        </motion.div>
      </div>
    </div>
  )
}
