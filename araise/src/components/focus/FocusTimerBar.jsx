import { motion } from "framer-motion"
import { Clock, Play, Pause, Square } from "lucide-react"

export default function FocusTimerBar({ 
  isVisible, 
  timeRemaining, 
  totalTime, 
  isRunning, 
  sessionName,
  onTogglePause,
  onStop 
}) {
  if (!isVisible) return null

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0

  return (
    <motion.div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      <div className="glass-card px-4 py-3 rounded-full border border-ar-gray-700/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Session Info */}
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-ar-blue" />
            <span className="text-sm text-ar-white font-medium">
              {sessionName}
            </span>
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2">
            <div className="text-lg font-mono text-ar-white">
              {formatTime(timeRemaining)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-20 h-2 bg-ar-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-ar-blue rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePause}
              className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
              title={isRunning ? "Pause" : "Resume"}
            >
              {isRunning ? (
                <Pause size={16} className="text-ar-yellow" />
              ) : (
                <Play size={16} className="text-ar-green" />
              )}
            </button>
            
            <button
              onClick={onStop}
              className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
              title="Stop Session"
            >
              <Square size={16} className="text-ar-red" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}