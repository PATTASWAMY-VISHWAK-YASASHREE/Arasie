import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pause, Play, SkipForward, Square } from "lucide-react"

export default function LiveSession({ 
  sessionData, 
  onComplete, 
  onEnd, 
  onPause, 
  onResume,
  onSkipBreak,
  onProgressUpdate // New callback for real-time progress updates
}) {
  // Initialize session structure based on break type
  const initializeSession = () => {
    if (sessionData.breakType === 'custom' && sessionData.customCycles) {
      // Custom cycles: create phases array
      const phases = []
      sessionData.customCycles.forEach((cycle, index) => {
        phases.push({ type: 'focus', duration: cycle.focus * 60, cycleIndex: index })
        phases.push({ type: 'break', duration: cycle.break * 60, cycleIndex: index })
      })
      return {
        phases,
        currentPhaseIndex: 0,
        totalPhases: phases.length
      }
    } else if (sessionData.breakType === 'pomodoro') {
      // Standard Pomodoro: focus + break
      return {
        phases: [
          { type: 'focus', duration: sessionData.duration * 60, cycleIndex: 0 },
          { type: 'break', duration: 5 * 60, cycleIndex: 0 }
        ],
        currentPhaseIndex: 0,
        totalPhases: 2
      }
    } else {
      // No breaks: just focus
      return {
        phases: [
          { type: 'focus', duration: sessionData.duration * 60, cycleIndex: 0 }
        ],
        currentPhaseIndex: 0,
        totalPhases: 1
      }
    }
  }

  const [sessionStructure] = useState(initializeSession())
  
  // Generate a consistent session ID for persistence (without Date.now() so it's the same across reloads)
  const sessionId = `focus-session-${sessionData.name}-${sessionData.duration}-${sessionData.breakType || 'none'}`
  
  // Initialize session with persistence
  const initializeSessionState = () => {
    const savedSession = localStorage.getItem(sessionId)
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession)
        return {
          currentPhaseIndex: parsed.currentPhaseIndex || 0,
          timeRemaining: parsed.timeRemaining || sessionStructure.phases[0]?.duration || 0,
          totalFocusTime: parsed.totalFocusTime || 0,
          timeSpentInCurrentPhase: parsed.timeSpentInCurrentPhase || 0
        }
      } catch (error) {
        console.error('Error parsing saved session:', error)
      }
    }
    
    return {
      currentPhaseIndex: 0,
      timeRemaining: sessionStructure.phases[0]?.duration || 0,
      totalFocusTime: 0,
      timeSpentInCurrentPhase: 0
    }
  }

  const initialState = initializeSessionState()
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialState.currentPhaseIndex)
  const [timeRemaining, setTimeRemaining] = useState(initialState.timeRemaining)
  const [isPaused, setIsPaused] = useState(false)
  const [totalFocusTime, setTotalFocusTime] = useState(initialState.totalFocusTime)
  const [timeSpentInCurrentPhase, setTimeSpentInCurrentPhase] = useState(initialState.timeSpentInCurrentPhase)

  const currentPhase = sessionStructure.phases[currentPhaseIndex]
  const isBreak = currentPhase?.type === 'break'
  const isLastPhase = currentPhaseIndex === sessionStructure.phases.length - 1

  // Debug: Log session data to see what's being passed
  console.log('LiveSession sessionData:', sessionData)

  // Save session state to localStorage
  const saveSessionState = () => {
    const sessionState = {
      currentPhaseIndex,
      timeRemaining,
      totalFocusTime,
      timeSpentInCurrentPhase,
      taskId: sessionData.taskId, // Include taskId for real-time progress tracking
      lastSaved: Date.now()
    }
    localStorage.setItem(sessionId, JSON.stringify(sessionState))
  }

  // Save state whenever it changes
  useEffect(() => {
    saveSessionState()
  }, [currentPhaseIndex, timeRemaining, totalFocusTime, timeSpentInCurrentPhase])

  // Clear saved session when component unmounts or session completes
  useEffect(() => {
    return () => {
      // Only clear if session is actually complete, not just paused
      if (timeRemaining === 0 && isLastPhase) {
        localStorage.removeItem(sessionId)
      }
    }
  }, [sessionId, timeRemaining, isLastPhase])

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let completedTime = 0
    let totalTime = 0
    
    // Add completed phases
    for (let i = 0; i < currentPhaseIndex; i++) {
      completedTime += sessionStructure.phases[i].duration
    }
    
    // Add current phase progress
    if (currentPhase) {
      completedTime += (currentPhase.duration - timeRemaining)
    }
    
    // Calculate total time
    sessionStructure.phases.forEach(phase => {
      totalTime += phase.duration
    })
    
    return totalTime > 0 ? (completedTime / totalTime) * 100 : 0
  }

  const progress = calculateOverallProgress()

  // Timer effect
  useEffect(() => {
    let interval = null
    
    if (!isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handlePhaseComplete()
            return 0
          }
          return prev - 1
        })
        
        // Track time spent in current phase (only for focus phases)
        if (currentPhase?.type === 'focus') {
          setTimeSpentInCurrentPhase(prev => {
            const newTimeSpent = prev + 1
            
            // Call real-time progress update callback
            if (onProgressUpdate && sessionData.taskId) {
              const totalSecondsSpent = (totalFocusTime * 60) + newTimeSpent
              const minutesSpent = Math.floor(totalSecondsSpent / 60)
              onProgressUpdate(sessionData.taskId, minutesSpent)
            }
            
            return newTimeSpent
          })
        }
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPaused, timeRemaining, currentPhase])

  const handlePhaseComplete = () => {
    // Track focus time for completed phase
    if (currentPhase?.type === 'focus') {
      const phaseMinutes = Math.floor(currentPhase.duration / 60)
      setTotalFocusTime(prev => prev + phaseMinutes)
    }

    if (isLastPhase) {
      // Clear saved session state since session is complete
      localStorage.removeItem(sessionId)
      
      // Session completely finished
      const focusMinutes = sessionStructure.phases
        .filter(phase => phase.type === 'focus')
        .reduce((total, phase) => total + Math.floor(phase.duration / 60), 0)
      
      onComplete({
        duration: focusMinutes,
        task: sessionData.name,
        completed: true
      })
    } else {
      // Move to next phase
      const nextPhaseIndex = currentPhaseIndex + 1
      const nextPhase = sessionStructure.phases[nextPhaseIndex]
      
      setCurrentPhaseIndex(nextPhaseIndex)
      setTimeRemaining(nextPhase.duration)
      setTimeSpentInCurrentPhase(0) // Reset time spent for new phase
    }
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      onResume?.()
    } else {
      onPause?.()
    }
  }

  const handleSkip = () => {
    if (isBreak) {
      onSkipBreak?.()
      
      if (isLastPhase) {
        // This was the last break, complete session
        const focusMinutes = sessionStructure.phases
          .filter(phase => phase.type === 'focus')
          .reduce((total, phase) => total + Math.floor(phase.duration / 60), 0)
        
        onComplete({
          duration: focusMinutes,
          task: sessionData.name,
          completed: true
        })
      } else {
        // Skip to next phase
        const nextPhaseIndex = currentPhaseIndex + 1
        const nextPhase = sessionStructure.phases[nextPhaseIndex]
        
        setCurrentPhaseIndex(nextPhaseIndex)
        setTimeRemaining(nextPhase.duration)
        setTimeSpentInCurrentPhase(0) // Reset time spent for new phase
      }
    }
  }

  const handleEnd = () => {
    // Clear saved session state
    localStorage.removeItem(sessionId)
    
    // Calculate total time spent across all focus phases
    let totalTimeSpentMinutes = 0
    
    // Add completed focus phases
    for (let i = 0; i < currentPhaseIndex; i++) {
      const phase = sessionStructure.phases[i]
      if (phase.type === 'focus') {
        totalTimeSpentMinutes += Math.floor(phase.duration / 60)
      }
    }
    
    // Add time spent in current phase (if it's a focus phase)
    if (currentPhase?.type === 'focus') {
      const currentPhaseTimeSpent = currentPhase.duration - timeRemaining
      totalTimeSpentMinutes += Math.floor(currentPhaseTimeSpent / 60)
    }
    

    
    // If user spent any time focusing, record it as a partial session
    if (totalTimeSpentMinutes > 0) {
      onComplete({
        duration: totalTimeSpentMinutes,
        task: sessionData.name,
        completed: false // Mark as incomplete since user ended early
      })
    } else {
      onEnd?.()
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getMotivationalText = () => {
    if (isBreak) {
      const breakMinutes = Math.floor(currentPhase.duration / 60)
      return `Break – ${breakMinutes} min | Breathe & relax 💧`
    }
    if (isPaused) {
      return "Paused – Take your time, we'll wait"
    }
    
    // Show cycle progress for custom cycles
    if (sessionData.cycles) {
      const currentCycle = currentPhase.cycleIndex + 1
      const totalCycles = sessionData.cycles
      const completedBreaks = Math.max(0, currentCycle - 1)
      return `Cycle ${currentCycle}/${totalCycles} • ${completedBreaks} break${completedBreaks !== 1 ? 's' : ''} completed – Stay focused!`
    }
    
    return "Every second counts. Stay focused."
  }

  const getPhaseInfo = () => {
    // For custom focus sessions with cycles
    if (sessionData.cycles) {
      const currentCycle = currentPhase.cycleIndex + 1
      const totalCycles = sessionData.cycles
      const phaseType = isBreak ? 'Break' : 'Focus'
      const completedBreaks = Math.max(0, currentCycle - 1)
      return `${phaseType} - Cycle ${currentCycle}/${totalCycles} • ${completedBreaks} break${completedBreaks !== 1 ? 's' : ''} completed`
    }
    return isBreak ? 'Break Time' : 'Focus Session'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-card p-4 md:p-8 rounded-2xl max-w-md w-full text-center transition-all duration-1000 ${
          isBreak ? 'bg-green-500/5 border-green-500/20' : 'bg-purple-500/5 border-purple-500/20'
        }`}
      >
        {/* Task Name */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl md:text-2xl font-hagrid font-light text-ar-white mb-2">
            {sessionData.name}
          </h2>
          <p className="text-ar-gray-400 text-xs md:text-sm mb-3">
            {getPhaseInfo()}
          </p>
          
          {/* Cycle Progress Indicator */}
          {sessionData.cycles && (
            <div className="flex justify-center gap-2 mb-2">
              {Array.from({ length: sessionData.cycles }, (_, index) => {
                const cycleCompleted = currentPhase.cycleIndex > index
                const cycleActive = currentPhase.cycleIndex === index
                
                return (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      cycleCompleted 
                        ? 'bg-green-400' 
                        : cycleActive 
                        ? (isBreak ? 'bg-blue-400' : 'bg-purple-400')
                        : 'bg-ar-gray-600'
                    }`}
                  />
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Circular Timer */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-6 md:mb-8">
          {/* Background circle */}
          <div className="absolute inset-0 border-4 border-ar-gray-700 rounded-full"></div>
          
          {/* Animated progress ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke={isBreak ? "#10B981" : "#8B5CF6"}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * (0.46 * 128)}`}
              strokeDashoffset={`${2 * Math.PI * (0.46 * 128) * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Subtle pulse animation */}
          <motion.div
            animate={{ 
              scale: isPaused ? 1 : [1, 1.02, 1],
              opacity: isPaused ? 0.7 : 1
            }}
            transition={{ 
              duration: 2, 
              repeat: isPaused ? 0 : Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-4 border border-purple-400/30 rounded-full"
          />
          
          {/* Timer display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <motion.div 
                key={timeRemaining}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-3xl md:text-4xl font-light text-ar-white mb-2"
              >
                {formatTime(timeRemaining)}
              </motion.div>
              <div className="text-xs md:text-sm text-ar-gray-400">
                {isBreak ? 'Break' : 'Focus'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 md:gap-4 mb-4 md:mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            className={`p-2 md:p-3 rounded-xl transition-colors ${
              isBreak 
                ? 'bg-green-600 hover:bg-green-500' 
                : 'bg-purple-600 hover:bg-purple-500'
            } text-white`}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </motion.button>
          
          {isBreak && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              className="p-2 md:p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
            >
              <SkipForward size={18} />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnd}
            className="p-2 md:p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
          >
            <Square size={18} />
          </motion.button>
        </div>

        {/* Motivational Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={getMotivationalText()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-ar-gray-400 text-xs md:text-sm italic"
          >
            {getMotivationalText()}
          </motion.div>
        </AnimatePresence>



        {/* Break-specific CTA */}
        {isBreak && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSkip}
            className="mt-4 px-4 md:px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-xs md:text-sm"
          >
            {isLastPhase ? 'Skip Break → Complete Session' : 'Skip Break → Next Focus'}
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}