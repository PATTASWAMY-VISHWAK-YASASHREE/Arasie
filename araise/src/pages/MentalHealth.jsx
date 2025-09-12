import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wind, Music, BookOpen, Sun } from "lucide-react"
import { useUserStore } from "../store/userStore"
import Chat from "../components/mental-health/Chat"
import GuidedBreathing from "../components/mental-health/GuidedBreathing"
import Journaling from "../components/mental-health/Journaling"
import SoundHealing from "../components/mental-health/SoundHealing"
import MiniMeditation from "../components/mental-health/MiniMeditation"

// Simplified mood options - horizontal layout
const moodOptions = [
  { id: 'happy', emoji: '😃', message: "Love that! Keep glowing ✨", color: 'hover:bg-yellow-500/10' },
  { id: 'good', emoji: '🙂', message: "Great to hear! You're doing amazing", color: 'hover:bg-green-500/10' },
  { id: 'neutral', emoji: '😐', message: "A balanced day, want a quick journal?", color: 'hover:bg-blue-500/10' },
  { id: 'down', emoji: '😟', message: "I'm here for you. Let's take this step by step", color: 'hover:bg-orange-500/10' },
  { id: 'sad', emoji: '😢', message: "It's okay, let's take a calming breath 🌬", color: 'hover:bg-purple-500/10' },
]

// Core wellness tools - with background images
const wellnessTools = [
  {
    id: 'breathing',
    title: 'Guided Breathing',
    description: 'Animated inhale/exhale exercises',
    icon: Wind,
    backgroundImage: '/images/mental-health/GuidedBreathing.jpg',
    gradient: 'from-blue-600/80 to-cyan-600/80'
  },
  {
    id: 'journal',
    title: 'Journaling',
    description: 'AI reflective prompts & writing',
    icon: BookOpen,
    backgroundImage: '/images/mental-health/Journaling.jpg',
    gradient: 'from-purple-600/80 to-pink-600/80'
  },
  {
    id: 'sounds',
    title: 'Sound Healing',
    description: 'Nature sounds & calm music',
    icon: Music,
    backgroundImage: '/images/mental-health/SoundHealing.jpg',
    gradient: 'from-green-600/80 to-emerald-600/80'
  },
  {
    id: 'meditation',
    title: 'Mini Meditation',
    description: 'Short sessions (2-5 mins)',
    icon: Sun,
    backgroundImage: '/images/mental-health/Meditation.jpg',
    gradient: 'from-orange-600/80 to-amber-600/80'
  },
]

export default function MentalHealth() {
  const [activeSection, setActiveSection] = useState('main')
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodMessage, setMoodMessage] = useState('')

  const { name, updateMentalHealthProgress } = useUserStore()

  const handleBackToMain = () => {
    setActiveSection('main')
  }

  // Component routing
  if (activeSection === 'breathing') {
    return <GuidedBreathing onBack={handleBackToMain} />
  }

  if (activeSection === 'journal') {
    return <Journaling onBack={handleBackToMain} />
  }

  if (activeSection === 'sounds') {
    return <SoundHealing onBack={handleBackToMain} />
  }

  if (activeSection === 'meditation') {
    return <MiniMeditation onBack={handleBackToMain} />
  }

  if (activeSection === 'chat') {
    return <Chat onBack={handleBackToMain} />
  }

  // Main page layout

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto pt-4 sm:pt-6 px-3 sm:px-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-2"
      >
        <h1 className="text-2xl sm:text-3xl font-hagrid font-light text-ar-white mb-1">
          Hi {name || '[Name]'}, how are you feeling today?
        </h1>
      </motion.div>

      {/* Mood Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 sm:p-6 rounded-2xl"
      >
        <div className="flex justify-center gap-1 sm:gap-4 mb-4 flex-wrap px-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              onClick={() => {
                setSelectedMood(mood)
                setMoodMessage(mood.message)
                updateMentalHealthProgress(20)
              }}
              className={`p-2 sm:p-4 rounded-2xl transition-all transform hover:scale-110 flex-shrink-0 ${mood.color} ${selectedMood?.id === mood.id ? 'scale-110 bg-white/10' : ''
                }`}
            >
              <div className="text-2xl sm:text-4xl">{mood.emoji}</div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {moodMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20"
            >
              <p className="text-ar-white font-hagrid font-light">{moodMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Wellness Companion - Modern Grid Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl group cursor-pointer h-80 sm:h-96"
          onClick={() => setActiveSection('chat')}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: "url('/images/mental-health/chat.jpg')"
            }}
          ></div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-500"></div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-12 text-center h-full flex flex-col justify-center">
            {/* Title */}
            <h2 className="text-2xl sm:text-4xl font-hagrid font-light text-white mb-4 sm:mb-6 drop-shadow-lg">
              Wellness Companion
            </h2>

            {/* Description */}
            <p className="text-white/90 text-base sm:text-xl leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto drop-shadow-md px-2">
              A safe space where you can share and express your feelings, document your life journey,
              and create a nurturing mental wellness environment
            </p>

            {/* Call to Action Button - Transparent Style */}
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 hover:border-white/50 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Open Chat
            </button>
          </div>
        </div>

        {/* Features Row - Horizontal line */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 text-ar-gray-400 flex-wrap px-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm">Always available</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-xs sm:text-sm">Private & secure</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-xs sm:text-sm">Judgment-free zone</span>
          </div>
        </div>
      </motion.div>

      {/* Coping Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl sm:text-2xl font-hagrid font-light text-ar-white mb-4 sm:mb-6 text-center px-2">Coping Tools</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {wellnessTools.map((tool) => {
            const Icon = tool.icon
            return (
              <motion.button
                key={tool.id}
                onClick={() => setActiveSection(tool.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl group cursor-pointer h-32 sm:h-40"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('${tool.backgroundImage}')`
                  }}
                ></div>
                
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between text-left">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon size={16} className="text-white sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm sm:text-lg font-hagrid font-light text-white mb-1 drop-shadow-lg group-hover:text-white/90 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-white/80 text-xs leading-relaxed drop-shadow-sm line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
      </div>
    </div>
  )
}
