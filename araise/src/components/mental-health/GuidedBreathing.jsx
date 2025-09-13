import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUserStore } from "../../store/userStore"
import UnifiedBreathingSession from "./breathing-exercises/UnifiedBreathingSession"

export default function GuidedBreathing({ onBack }) {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [isBreathing, setIsBreathing] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const { updateMentalHealthProgress } = useUserStore()

  const breathingExercises = [
    {
      id: 'box',
      name: 'Box Breathing',
      subtitle: 'Stress relief & grounding',
      purpose: 'Stress relief, grounding, calming nerves',
      duration: '1:20',
      cycles: 5,
      color: '#3b82f6',
      gradient: 'from-blue-600 to-blue-800',
      backgroundImage: '/images/mental-health/GuidedBreathing/box breathing.jpg',
      steps: [
        { name: 'Inhale', duration: 4000, instruction: 'Breathe in slowly for 4 seconds' },
        { name: 'Hold', duration: 4000, instruction: 'Hold your breath for 4 seconds' },
        { name: 'Exhale', duration: 4000, instruction: 'Breathe out slowly for 4 seconds' },
        { name: 'Hold', duration: 4000, instruction: 'Hold empty for 4 seconds' }
      ]
    },
    {
      id: '478',
      name: '4-7-8 Breathing',
      subtitle: 'Relaxation & Sleep Aid',
      purpose: 'Calms the nervous system, reduces anxiety, helps induce sleep',
      duration: '1:16',
      cycles: 4,
      color: '#9333ea',
      gradient: 'from-purple-600 to-purple-800',
      backgroundImage: '/images/mental-health/GuidedBreathing/4-7-8 Breathing.jpg',
      steps: [
        { name: 'Inhale', duration: 4000, instruction: 'Breathe in through your nose for 4 seconds' },
        { name: 'Hold', duration: 7000, instruction: 'Hold your breath gently for 7 seconds' },
        { name: 'Exhale', duration: 8000, instruction: 'Exhale fully through your mouth for 8 seconds' }
      ]
    },
    {
      id: 'alternate-nostril',
      name: 'Alternate Nostril',
      subtitle: 'Balance & Focus',
      purpose: 'Balances nervous system, improves focus and mental clarity',
      duration: '1:12',
      cycles: 6,
      color: '#14b8a6',
      gradient: 'from-teal-600 to-teal-800',
      backgroundImage: '/images/mental-health/GuidedBreathing/Alternate Nostril Breathing.jpg',
      steps: [
        { name: 'Inhale Left', duration: 4000, instruction: 'Close right nostril, inhale through left for 4 seconds' },
        { name: 'Hold', duration: 4000, instruction: 'Close both nostrils, hold for 4 seconds' },
        { name: 'Exhale Right', duration: 4000, instruction: 'Close left nostril, exhale through right for 4 seconds' }
      ]
    },
    {
      id: 'deep-breathing',
      name: 'Deep Focus Breathing',
      subtitle: 'Simple & Effective',
      purpose: 'Basic relaxation, stress relief, mindfulness practice',
      duration: '1:20',
      cycles: 8,
      color: '#22c55e',
      gradient: 'from-green-600 to-green-800',
      backgroundImage: '/images/mental-health/GuidedBreathing/Deep Focus Breathing.jpg',
      steps: [
        { name: 'Inhale', duration: 5000, instruction: 'Breathe in deeply for 5 seconds' },
        { name: 'Exhale', duration: 5000, instruction: 'Breathe out slowly for 5 seconds' }
      ]
    },
    {
      id: 'resonance',
      name: 'Resonance Breathing',
      subtitle: 'Heart Rate Variability',
      purpose: 'Optimizes heart rate variability, reduces stress hormones',
      duration: '2:45',
      cycles: 15,
      color: '#f97316',
      gradient: 'from-orange-600 to-orange-800',
      backgroundImage: '/images/mental-health/GuidedBreathing/Resonance Breathing.jpg',
      steps: [
        { name: 'Inhale', duration: 5500, instruction: 'Breathe in gently for 5.5 seconds' },
        { name: 'Exhale', duration: 5500, instruction: 'Breathe out smoothly for 5.5 seconds' }
      ]
    },
    {
      id: 'belly-breathing',
      name: 'Belly Breathing',
      subtitle: 'Diaphragmatic Focus',
      purpose: 'Strengthens diaphragm, reduces shallow breathing patterns',
      duration: '2:00',
      cycles: 12,
      color: '#6366f1',
      gradient: 'from-indigo-600 to-indigo-800',
      backgroundImage: '/images/mental-health/GuidedBreathing/Belly Breathing.jpg',
      steps: [
        { name: 'Inhale', duration: 4000, instruction: 'Breathe into your belly for 4 seconds' },
        { name: 'Exhale', duration: 6000, instruction: 'Slowly exhale from your belly for 6 seconds' }
      ]
    }
  ]



  const handleSessionComplete = () => {
    const exercise = breathingExercises.find(ex => ex.id === selectedExercise)
    if (exercise) {
      // Calculate session duration in seconds
      const sessionDuration = exercise.cycles * exercise.steps.reduce((sum, step) => sum + step.duration, 0) / 1000
      
      // Log the breathing session
      const { logBreathingSession, updateMentalHealthProgress } = useUserStore.getState()
      logBreathingSession(exercise.name, sessionDuration)
      
      // Add progress (25% for completing a breathing session)
      updateMentalHealthProgress(25)
    }
    
    setIsBreathing(false)
    setSessionComplete(true)
  }



  const handleStartExercise = (exerciseId) => {
    setSelectedExercise(exerciseId)
    setIsBreathing(true)
    setSessionComplete(false)
  }

  const handleEndSession = () => {
    // First stop the breathing session
    setIsBreathing(false)
    // Small delay to ensure the session stops before clearing other states
    setTimeout(() => {
      setSelectedExercise(null)
      setSessionComplete(false)
    }, 100)
  }

  const handleRestartSession = () => {
    setSessionComplete(false)
    setIsBreathing(true)
  }

  const renderBreathingSession = () => {
    if (!selectedExercise) return null

    const exercise = breathingExercises.find(ex => ex.id === selectedExercise)
    if (!exercise) return null

    return (
      <UnifiedBreathingSession
        exercise={exercise}
        isActive={isBreathing}
        onComplete={handleSessionComplete}
      />
    )
  }

  const renderCompletionScreen = () => {
    const exercise = breathingExercises.find(ex => ex.id === selectedExercise)

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl mx-auto"
      >
        <div className={`glass-card p-8 rounded-2xl bg-gradient-to-br ${exercise?.gradient}`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-6"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl font-hagrid font-light text-white mb-4">
            Session Complete!
          </h2>

          <p className="text-white/80 text-lg mb-6">
            You just completed {exercise?.cycles} cycles of {exercise?.name.toLowerCase()}
          </p>

          <div className="bg-white/10 rounded-xl p-4 mb-8">
            <p className="text-white/90 text-sm">
              "Great job taking time for your mental wellness. Regular breathing exercises can help reduce stress, improve focus, and promote overall well-being."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestartSession}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all font-medium backdrop-blur-sm"
            >
              Practice Again
            </button>
            <button
              onClick={() => {
                setSessionComplete(false)
                setSelectedExercise(null)
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all font-medium backdrop-blur-sm"
            >
              Choose Another Exercise
            </button>
            <button
              onClick={onBack}
              className="bg-ar-gray-700 hover:bg-ar-gray-600 text-white px-6 py-3 rounded-xl transition-colors font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Dynamic background gradient based on selected exercise */}
      <div className={`fixed inset-0 bg-gradient-to-br ${selectedExercise
        ? breathingExercises.find(ex => ex.id === selectedExercise)?.gradient
        : 'from-ar-gray-900 to-ar-gray-800'
        } opacity-10 transition-all duration-1000`} />

      <div className="relative z-10 max-w-6xl mx-auto pt-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={sessionComplete ? () => setSessionComplete(false) : (isBreathing ? handleEndSession : onBack)}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-hagrid font-light text-ar-white">🌬 Guided Breathing</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {sessionComplete ? (
            <motion.div
              key="completion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {renderCompletionScreen()}
            </motion.div>
          ) : !isBreathing ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">
                  Choose Your Breathing Exercise
                </h2>
                <p className="text-ar-gray-400">
                  Select a scientifically-backed technique that matches your current needs
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
                {breathingExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    className="relative h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden border border-white/10 hover:border-white/30"
                    onClick={() => handleStartExercise(exercise.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
                      style={{ 
                        backgroundImage: `url("${exercise.backgroundImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-all duration-300" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-3 sm:p-4 md:p-8">
                      <div className="flex flex-col items-center justify-center h-full">
                        <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 sm:mb-3 group-hover:text-white/90 transition-colors duration-300 leading-tight">
                          {exercise.name}
                        </h3>

                        <p className="text-white/80 mb-3 sm:mb-4 md:mb-6 leading-relaxed group-hover:text-white/70 transition-colors duration-300 text-xs sm:text-sm md:text-base text-center">
                          {exercise.subtitle}
                        </p>

                        <button className="w-full font-bold py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:border-white/50 hover:shadow-lg transform group-hover:translate-y-0 translate-y-1 text-xs sm:text-sm md:text-base">
                          Start Exercise
                        </button>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-t to-transparent"
                      style={{ backgroundColor: `${exercise.color}30` }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              {renderBreathingSession()}

              <div className="mt-8">
                <button
                  onClick={handleEndSession}
                  className="bg-ar-gray-700 hover:bg-ar-gray-600 text-white px-8 py-3 rounded-xl transition-colors font-medium"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}