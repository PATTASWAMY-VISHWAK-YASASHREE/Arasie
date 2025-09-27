import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Play } from "lucide-react"
import { createPortal } from "react-dom"

export default function CustomSessionModal({ isOpen, onClose, onStartSession }) {
  const [focusDuration, setFocusDuration] = useState(30)
  const [breakDuration, setBreakDuration] = useState(5)
  const [cycles, setCycles] = useState(1)
  const [sessionName, setSessionName] = useState("Custom Focus")

  const handleStart = () => {
    const sessionData = {
      mode: 'custom',
      name: sessionName.trim() || 'Custom Focus',
      duration: focusDuration,
      breakDuration: breakDuration,
      cycles: cycles
    }
    
    onStartSession(sessionData)
    onClose()
  }

  const calculateTotalTime = () => {
    const totalFocusTime = focusDuration * cycles
    const totalBreakTime = breakDuration * Math.max(0, cycles - 1)
    return totalFocusTime + totalBreakTime
  }

  const calculateXP = () => {
    const totalMinutes = calculateTotalTime()
    const baseXP = Math.round(totalMinutes / 5)
    return totalMinutes >= 60 ? Math.round(baseXP * 1.2) : baseXP
  }

  if (!isOpen) {
    return null
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      style={{ zIndex: 99999, position: 'fixed' }}
    >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-ar-gray-800 border border-ar-gray-700 rounded-2xl p-4 md:p-6 w-full max-w-sm md:max-w-md mx-4 relative"
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 100000, position: 'relative' }}
        >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-hagrid font-light text-ar-white">Custom Focus Session</h2>
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-ar-gray-700 rounded-lg transition-colors touch-manipulation"
              >
                <X size={18} className="text-ar-gray-400" />
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Session Name */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-ar-gray-300 mb-1.5 md:mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-lg p-2.5 md:p-3 text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none text-sm md:text-base"
                  placeholder="Enter session name"
                />
              </div>

              {/* Focus Duration */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-ar-gray-300 mb-1.5 md:mb-2">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-lg p-2.5 md:p-3 text-ar-white focus:border-ar-blue focus:outline-none text-sm md:text-base"
                />
              </div>

              {/* Break Duration */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-ar-gray-300 mb-1.5 md:mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-lg p-2.5 md:p-3 text-ar-white focus:border-ar-blue focus:outline-none text-sm md:text-base"
                />
              </div>

              {/* Cycles */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-ar-gray-300 mb-1.5 md:mb-2">
                  Number of Cycles
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cycles}
                  onChange={(e) => setCycles(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-lg p-2.5 md:p-3 text-ar-white focus:border-ar-blue focus:outline-none text-sm md:text-base"
                />
              </div>

              {/* Session Summary */}
              <div className="bg-ar-gray-700/40 border border-ar-gray-600 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-ar-blue" />
                  <span className="text-xs md:text-sm font-medium text-ar-white">Session Summary</span>
                </div>
                <div className="space-y-1 text-xs md:text-sm text-ar-gray-300">
                  <div>Total Time: {Math.floor(calculateTotalTime() / 60)}h {calculateTotalTime() % 60}m</div>
                  <div>Focus: {focusDuration}m × {cycles} cycle{cycles > 1 ? 's' : ''}</div>
                  {breakDuration > 0 && (
                    <div>Break: {breakDuration}m × {Math.max(0, cycles - 1)} break{cycles > 2 ? 's' : ''}</div>
                  )}
                  <div className="text-ar-blue">Estimated XP: {calculateXP()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 md:gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white rounded-lg p-2.5 md:p-3 transition-colors text-sm md:text-base touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 bg-ar-blue hover:bg-ar-blue/80 text-white rounded-lg p-2.5 md:p-3 transition-colors flex items-center justify-center gap-2 text-sm md:text-base touch-manipulation"
                >
                  <Play size={14} />
                  Start Session
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
  )
}
