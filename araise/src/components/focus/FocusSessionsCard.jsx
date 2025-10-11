import { useState } from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import CustomSessionModal from "./CustomSessionModal"


const SESSION_MODES = [
  {
    id: 'quick',
    name: 'Quick Focus',
    duration: 25,
    breakDuration: 0,
    cycles: 1,
    color: 'green',
    icon: '⏱️',
    description: '25 min session'
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 25,
    breakDuration: 5,
    cycles: 4,
    color: 'red',
    icon: '🍅',
    description: '25/5 cycles'
  },
  {
    id: 'deep',
    name: 'Deep Work',
    duration: 90,
    breakDuration: 15,
    cycles: 1,
    color: 'blue',
    icon: '🧠',
    description: '90 min session'
  },
  {
    id: 'custom',
    name: 'Custom',
    duration: 30,
    breakDuration: 5,
    cycles: 1,
    color: 'yellow',
    icon: '⚙️',
    description: 'User-defined'
  }
]

export default function FocusSessionsCard({ onStartSession }) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  const handleStartSession = (mode) => {
    if (mode === 'custom') {
      setIsCustomModalOpen(true)
      return
    }

    const sessionMode = SESSION_MODES.find(m => m.id === mode)
    if (!sessionMode) return

    const sessionData = {
      mode: mode,
      duration: sessionMode.duration,
      breakDuration: sessionMode.breakDuration,
      cycles: sessionMode.cycles,
      name: sessionMode.name
    }

    // Notify parent component to start the actual focus session
    if (onStartSession) {
      onStartSession(sessionData)
    }
  }

  const handleCustomSessionStart = (sessionData) => {
    // Notify parent component to start the custom focus session
    if (onStartSession) {
      onStartSession(sessionData)
    }
  }

  const getCardColor = (color) => {
    const colors = {
      green: 'bg-green-500/10 border-green-500/30 text-green-300',
      red: 'bg-red-500/10 border-red-500/30 text-red-300',
      blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
    }
    return colors[color] || colors.green
  }

  const getCardHoverColor = (color) => {
    const colors = {
      green: 'hover:bg-green-500/20 hover:border-green-500/50',
      red: 'hover:bg-red-500/20 hover:border-red-500/50',
      blue: 'hover:bg-blue-500/20 hover:border-blue-500/50',
      yellow: 'hover:bg-yellow-500/20 hover:border-yellow-500/50'
    }
    return colors[color] || colors.green
  }

  return (
    <div className="glass-card p-3 md:p-6 rounded-xl md:rounded-2xl">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-base md:text-xl font-hagrid font-light text-ar-white">Quick Focus Session</h2>
        <div className="text-xs text-ar-gray-400 hidden sm:block">Tap to start</div>
      </div>

      {/* Mobile: Horizontal scroll layout for small screens */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
        {SESSION_MODES.map((mode) => {
          return (
            <motion.div
              key={mode.id}
              className={`flex-shrink-0 w-18 p-1.5 rounded-md border transition-all duration-300 cursor-pointer touch-manipulation ${getCardColor(mode.color)} ${getCardHoverColor(mode.color)}`}
              onClick={() => handleStartSession(mode.id)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <div className="text-sm mb-0.5">{mode.icon}</div>
                <div className="text-xs font-medium leading-tight">{mode.name}</div>
                <div className="text-xs opacity-70 leading-tight">{mode.description}</div>
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <Play size={6} />
                  <span className="text-xs">Start</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Desktop: Horizontal scroll layout */}
      <div className="hidden sm:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SESSION_MODES.map((mode) => {
          return (
            <motion.div
              key={mode.id}
              className={`flex-shrink-0 w-24 md:w-28 p-2 md:p-2.5 rounded-md border transition-all duration-300 cursor-pointer ${getCardColor(mode.color)} ${getCardHoverColor(mode.color)}`}
              onClick={() => handleStartSession(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{mode.icon}</div>
                <div className="text-xs font-medium leading-tight">{mode.name}</div>
                <div className="text-xs opacity-70 leading-tight">{mode.description}</div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Play size={8} />
                  <span className="text-xs">Start</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Custom Session Modal */}
      <CustomSessionModal 
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onStartSession={handleCustomSessionStart}
      />
    </div>
  )
}
