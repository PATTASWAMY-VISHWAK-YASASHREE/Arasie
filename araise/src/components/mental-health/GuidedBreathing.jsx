import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useUserStore } from "../../store/userStore"

export default function GuidedBreathing({ onBack }) {
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState(0)
  const { updateMentalHealthProgress } = useUserStore()

  // Simple breathing animation
  useEffect(() => {
    if (isBreathing) {
      const interval = setInterval(() => {
        setBreathingPhase(prev => (prev + 1) % 4) // 4 phases: inhale, hold, exhale, rest
      }, 4000) // 4 second cycles

      return () => clearInterval(interval)
    }
  }, [isBreathing])

  const getBreathingInstruction = () => {
    const instructions = ['Inhale slowly...', 'Hold gently...', 'Exhale completely...', 'Rest peacefully...']
    return instructions[breathingPhase] || 'Breathe naturally'
  }

  const handleStartBreathing = () => {
    setIsBreathing(true)
    updateMentalHealthProgress(25)
  }

  return (
    <div className="max-w-2xl mx-auto pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={onBack}
          className="text-ar-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-hagrid font-light text-ar-white">🌬 Guided Breathing</h1>
      </motion.div>

      <div className="glass-card p-8 rounded-2xl text-center">
        {!isBreathing ? (
          <div>
            <h2 className="text-xl font-hagrid font-light text-ar-white mb-6">
              Let's take a moment to breathe together
            </h2>
            <p className="text-ar-gray-400 mb-8">
              Follow the gentle rhythm and let your mind find peace
            </p>
            <button
              onClick={handleStartBreathing}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-lg transition-colors"
            >
              Start Breathing Exercise
            </button>
          </div>
        ) : (
          <div>
            <div className="relative w-48 h-48 mx-auto mb-8">
              <motion.div
                className="w-full h-full border-4 border-blue-400 rounded-full flex items-center justify-center"
                animate={{
                  scale: breathingPhase === 0 ? [1, 1.4] : breathingPhase === 2 ? [1.4, 1] : 1.4,
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                }}
              >
                <div className="text-lg font-hagrid font-light text-blue-400">
                  {getBreathingInstruction()}
                </div>
              </motion.div>
            </div>
            <button
              onClick={() => setIsBreathing(false)}
              className="bg-ar-gray-700 hover:bg-ar-gray-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  )
}