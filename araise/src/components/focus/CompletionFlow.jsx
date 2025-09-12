import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, RotateCcw, Edit3 } from "lucide-react"

export default function CompletionFlow({ 
  sessionData, 
  onReturnToDashboard, 
  onAddReflection,
  totalFocusedToday 
}) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [reflection, setReflection] = useState('')
  const [showReflectionInput, setShowReflectionInput] = useState(false)

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleAddReflection = () => {
    if (reflection.trim()) {
      onAddReflection?.(reflection)
    }
    onReturnToDashboard()
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1, 
                y: -100, 
                x: Math.random() * window.innerWidth,
                rotate: 0 
              }}
              animate={{ 
                opacity: 0, 
                y: window.innerHeight + 100,
                rotate: 360 
              }}
              transition={{ 
                duration: 3, 
                delay: Math.random() * 0.5,
                ease: "easeOut" 
              }}
              className="absolute w-3 h-3 bg-purple-400 rounded-full"
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-2xl max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} />
        </motion.div>

        {/* Completion Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-hagrid font-light text-ar-white mb-2">
            🎉 Task Completed!
          </h2>
          <p className="text-ar-gray-400">
            {sessionData.name} – {formatTime(sessionData.duration)} Focused
          </p>
        </motion.div>

        {/* Today's Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6"
        >
          <div className="text-sm text-ar-gray-400 mb-1">Today's Total</div>
          <div className="text-2xl font-light text-ar-white">
            {formatTime(totalFocusedToday)}
          </div>
        </motion.div>

        {/* Reflection Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6"
        >
          {!showReflectionInput ? (
            <button
              onClick={() => setShowReflectionInput(true)}
              className="w-full p-3 border-2 border-dashed border-ar-gray-600 rounded-xl text-ar-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              <Edit3 size={16} />
              Add Reflection (Optional)
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="How did this session go? Any insights or improvements for next time?"
                className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReflectionInput(false)}
                  className="flex-1 py-2 px-4 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReflection}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <button
            onClick={onReturnToDashboard}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-colors font-hagrid font-light"
          >
            Return to Dashboard
          </button>
          
          <button
            onClick={onReturnToDashboard} // Return to dashboard to start another session
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white rounded-xl transition-colors"
          >
            <RotateCcw size={16} />
            Start Another Session
          </button>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-ar-gray-400 text-sm italic"
        >
          "Every focused minute is a step towards mastery."
        </motion.div>
      </motion.div>
    </div>
  )
}