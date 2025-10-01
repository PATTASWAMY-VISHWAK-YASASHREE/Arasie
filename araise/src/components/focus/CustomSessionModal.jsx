import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Play } from "lucide-react"

export default function CustomSessionModal({ isOpen, onClose, onStartSession }) {
  const [duration, setDuration] = useState(30)
  const [breakDuration, setBreakDuration] = useState(5)
  const [cycles, setCycles] = useState(1)
  const [sessionName, setSessionName] = useState("")

  const handleStart = () => {
    const sessionData = {
      mode: 'custom',
      duration: duration,
      breakDuration: breakDuration,
      cycles: cycles,
      name: sessionName || `Custom ${duration}min Session`
    }
    
    onStartSession(sessionData)
    onClose()
  }

  const handleClose = () => {
    // Reset form
    setDuration(30)
    setBreakDuration(5)
    setCycles(1)
    setSessionName("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="glass-card p-6 rounded-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-hagrid font-light text-ar-white">Custom Session</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-ar-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Name */}
              <div>
                <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                  Session Name (Optional)
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Deep Work, Study Session"
                  className="w-full p-3 bg-ar-gray-800 border border-ar-gray-700 rounded-lg text-ar-white placeholder-ar-gray-500 focus:border-ar-blue focus:outline-none"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                  Focus Duration (minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-ar-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex items-center gap-1 text-ar-blue font-medium min-w-[60px]">
                    <Clock size={16} />
                    {duration}m
                  </div>
                </div>
              </div>

              {/* Break Duration */}
              <div>
                <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                  Break Duration (minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-ar-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex items-center gap-1 text-ar-green font-medium min-w-[60px]">
                    <Clock size={16} />
                    {breakDuration}m
                  </div>
                </div>
              </div>

              {/* Cycles */}
              <div>
                <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                  Number of Cycles
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={cycles}
                    onChange={(e) => setCycles(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-ar-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-ar-violet font-medium min-w-[40px]">
                    {cycles}x
                  </div>
                </div>
              </div>

              {/* Session Preview */}
              <div className="bg-ar-gray-800/50 rounded-lg p-3 border border-ar-gray-700">
                <div className="text-sm text-ar-gray-300 mb-1">Session Preview:</div>
                <div className="text-ar-white">
                  {cycles} cycle{cycles > 1 ? 's' : ''} of {duration} min focus
                  {breakDuration > 0 && ` + ${breakDuration} min break`}
                </div>
                <div className="text-xs text-ar-gray-400 mt-1">
                  Total time: ~{cycles * duration + (cycles - 1) * breakDuration} minutes
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="flex-1 px-4 py-3 bg-ar-blue hover:bg-ar-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Start Session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}