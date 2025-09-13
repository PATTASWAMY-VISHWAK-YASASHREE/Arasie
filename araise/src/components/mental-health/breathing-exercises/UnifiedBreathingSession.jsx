import { useState, useEffect, useRef } from "react"

export default function UnifiedBreathingSession({ exercise, isActive, onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [stepTimeLeft, setStepTimeLeft] = useState(0)
  const [totalTimeLeft, setTotalTimeLeft] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const isMountedRef = useRef(true)

  // Calculate total session time
  const totalSessionTime = exercise.cycles * exercise.steps.reduce((sum, step) => sum + step.duration, 0)

  useEffect(() => {
    isMountedRef.current = true

    if (!isActive || !exercise) {
      // Reset states when session becomes inactive
      setCurrentStepIndex(0)
      setCurrentCycle(1)
      setStepProgress(0)
      setSessionProgress(0)
      return
    }

    // Initialize session
    setCurrentStepIndex(0)
    setCurrentCycle(1)
    setTotalTimeLeft(Math.ceil(totalSessionTime / 1000))

    let stepIndex = 0
    let cycle = 1
    let totalElapsed = 0

    const runStep = () => {
      // Check if session is still active before completing
      if (cycle > exercise.cycles) {
        // Only call onComplete if the session is still active (not manually ended)
        if (isActive) {
          onComplete?.()
        }
        return
      }

      const currentStep = exercise.steps[stepIndex]
      setCurrentStepIndex(stepIndex)
      setCurrentCycle(cycle)
      setStepTimeLeft(Math.ceil(currentStep.duration / 1000))

      const stepDuration = currentStep.duration
      const interval = 50 // Update every 50ms for smooth animation
      const totalSteps = stepDuration / interval
      let currentStepCount = 0

      const timer = setInterval(() => {
        // Check if component is still mounted and session is active
        if (!isMountedRef.current || !isActive) {
          clearInterval(timer)
          return
        }

        currentStepCount++
        totalElapsed += interval

        // Update step progress
        const newStepProgress = (currentStepCount / totalSteps) * 100
        setStepProgress(Math.min(newStepProgress, 100))

        // Update step time left
        const stepElapsedTime = currentStepCount * interval
        const stepRemainingTime = Math.max(0, stepDuration - stepElapsedTime)
        setStepTimeLeft(Math.ceil(stepRemainingTime / 1000))

        // Update total time left
        const totalRemainingTime = Math.max(0, totalSessionTime - totalElapsed)
        setTotalTimeLeft(Math.ceil(totalRemainingTime / 1000))

        // Update session progress
        const newSessionProgress = (totalElapsed / totalSessionTime) * 100
        setSessionProgress(Math.min(newSessionProgress, 100))

        if (currentStepCount >= totalSteps) {
          clearInterval(timer)

          // Move to next step
          stepIndex++
          if (stepIndex >= exercise.steps.length) {
            stepIndex = 0
            cycle++
          }

          // Small delay before next step
          setTimeout(() => runStep(), 100)
        }
      }, interval)

      return () => clearInterval(timer)
    }

    runStep()

    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [isActive, exercise, totalSessionTime, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  if (!exercise || !isActive) return null

  const currentStep = exercise.steps[currentStepIndex]

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-hagrid font-light text-ar-white mb-2">
          {exercise.name}
        </h2>
        <p className="text-ar-gray-400">
          {exercise.subtitle}
        </p>
      </div>

      {/* Central Instruction Box */}
      <div className="relative mb-8">
        {/* Main breathing circle/box */}
        <div
          className="w-64 h-64 rounded-full border-4 border-white/20 flex items-center justify-center relative overflow-hidden transition-all duration-75 ease-linear"
          style={{
            backgroundColor: `${exercise.color}20`,
            borderColor: `${exercise.color}40`,
            transform: currentStep?.name?.toLowerCase().includes('inhale')
              ? `scale(${1 + stepProgress * 0.003})`
              : currentStep?.name?.toLowerCase().includes('exhale')
                ? `scale(${1.3 - stepProgress * 0.003})`
                : 'scale(1.15)'
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-75 ease-linear"
            style={{
              backgroundColor: `${exercise.color}30`,
              transform: `scale(${0.3 + (stepProgress / 100) * 0.7})`,
              opacity: currentStep?.name?.toLowerCase().includes('exhale')
                ? 1 - (stepProgress / 100) * 0.6
                : 1
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center">
            <div
              className="text-4xl font-bold mb-2"
              style={{ color: exercise.color }}
            >
              {currentStep?.name?.toUpperCase() || 'BREATHE'}
            </div>
            <div className="text-2xl font-medium text-white">
              {stepTimeLeft}s
            </div>
          </div>
        </div>

        {/* Step progress ring */}
        <svg className="absolute inset-0 w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={exercise.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - stepProgress / 100)}`}
            className="transition-all duration-75 ease-linear"
          />
        </svg>
      </div>

      {/* Instruction Text */}
      <div className="mb-8 max-w-md">
        <p className="text-lg text-ar-white mb-2">
          {currentStep?.instruction || 'Breathe naturally'}
        </p>
      </div>

      {/* Session Progress */}
      <div className="w-full max-w-md space-y-4">
        {/* Cycle Progress */}
        <div className="text-center">
          <div className="text-sm text-ar-gray-400 mb-2">
            Cycle {currentCycle} of {exercise.cycles}
          </div>

          {/* Cycle dots */}
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: exercise.cycles }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i < currentCycle ? `bg-[${exercise.color}]` :
                  i === currentCycle - 1 ? `bg-[${exercise.color}]` : 'bg-white/20'
                  }`}
                style={{
                  backgroundColor: i < currentCycle ? exercise.color :
                    i === currentCycle - 1 ? exercise.color : 'rgba(255,255,255,0.2)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Session Progress Bar */}
        <div className="w-full">
          <div className="flex justify-between text-sm text-ar-gray-400 mb-2">
            <span>Session Progress</span>
            <span>{formatTime(totalTimeLeft)} remaining</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${sessionProgress}%`,
                backgroundColor: exercise.color
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}