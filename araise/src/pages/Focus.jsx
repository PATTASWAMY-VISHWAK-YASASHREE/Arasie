import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain,
  Clock,
  Target,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Flame,
  Trophy,
  Calendar,
  Star,
  Leaf,
  TreePine,
  Settings
} from "lucide-react"
import { useUserStore } from "../store/userStore"

// Focus session types
const sessionTypes = [
  { 
    id: 'pomodoro', 
    title: 'Pomodoro', 
    description: '25 min focus + 5 min break',
    duration: 25 * 60,
    breakDuration: 5 * 60,
    color: 'bg-red-500'
  },
  { 
    id: 'custom', 
    title: 'Custom Timer', 
    description: 'Set your own duration',
    duration: 60 * 60,
    breakDuration: 10 * 60,
    color: 'bg-purple-500'
  },
  { 
    id: 'long', 
    title: 'Long Study', 
    description: '90 min deep focus',
    duration: 90 * 60,
    breakDuration: 15 * 60,
    color: 'bg-blue-500'
  },
]

// Daily goals options (in minutes)
const dailyGoalOptions = [30, 60, 90, 120, 180, 240]

// Background sounds
const backgroundSounds = [
  { id: 'none', title: 'Silence', description: 'Pure focus' },
  { id: 'rain', title: 'Rain', description: 'Gentle rainfall' },
  { id: 'cafe', title: 'Café Ambience', description: 'Coffee shop sounds' },
  { id: 'forest', title: 'Forest', description: 'Nature sounds' },
  { id: 'white-noise', title: 'White Noise', description: 'Pure white noise' },
]

export default function Focus() {
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedSessionType, setSelectedSessionType] = useState(sessionTypes[0])
  const [customDuration, setCustomDuration] = useState(60)
  const [currentTask, setCurrentTask] = useState('')
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isBreak, setIsBreak] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [dailyGoal, setDailyGoal] = useState(90) // Default 90 minutes
  const [dailyProgress, setDailyProgress] = useState(0)
  const [focusStreak, setFocusStreak] = useState(5)
  const [totalXP, setTotalXP] = useState(1250)
  const [level, setLevel] = useState(8)
  const [selectedSound, setSelectedSound] = useState('none')
  const [completedSessions, setCompletedSessions] = useState([])
  
  const { name, updateFocusProgress } = useUserStore()

  // Timer effect
  useEffect(() => {
    let interval = null
    
    if (isSessionActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSessionActive, isPaused, timeRemaining])

  const handleSessionComplete = () => {
    const sessionDuration = selectedSessionType.duration
    const minutes = Math.floor(sessionDuration / 60)
    
    // Add XP and update progress
    const xpGained = minutes * 2 // 2 XP per minute
    setTotalXP(prev => prev + xpGained)
    setDailyProgress(prev => Math.min(prev + minutes, dailyGoal))
    
    // Record completed session
    setCompletedSessions(prev => [...prev, {
      id: Date.now(),
      duration: minutes,
      task: currentTask,
      completedAt: new Date(),
      xpGained
    }])
    
    updateFocusProgress(Math.min((dailyProgress + minutes) / dailyGoal * 100, 100))
    
    if (!isBreak) {
      // Session completed, start break
      setIsBreak(true)
      setTimeRemaining(selectedSessionType.breakDuration)
    } else {
      // Break completed
      setIsBreak(false)
      setIsSessionActive(false)
    }
  }

  const startSession = () => {
    const duration = selectedSessionType.id === 'custom' 
      ? customDuration * 60 
      : selectedSessionType.duration
    
    setTimeRemaining(duration)
    setIsSessionActive(true)
    setIsBreak(false)
    setIsPaused(false)
  }

  const pauseSession = () => {
    setIsPaused(!isPaused)
  }

  const stopSession = () => {
    setIsSessionActive(false)
    setIsBreak(false)
    setIsPaused(false)
    setTimeRemaining(0)
  }

  const skipBreak = () => {
    if (isBreak) {
      setIsBreak(false)
      setIsSessionActive(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return Math.min((dailyProgress / dailyGoal) * 100, 100)
  }

  const getStreakIcon = () => {
    if (focusStreak < 3) return <Leaf className="text-green-400" size={24} />
    if (focusStreak < 7) return <TreePine className="text-green-500" size={24} />
    return <TreePine className="text-green-600" size={28} />
  }

  const getXPForNextLevel = () => {
    return level * 200 // Simple calculation: level * 200 XP
  }

  const getCurrentLevelXP = () => {
    return totalXP % getXPForNextLevel()
  }

  if (activeSection === 'session') {
    return (
      <div className="max-w-4xl mx-auto pt-6 h-full">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 rounded-2xl max-w-md mx-auto"
            >
              {/* Session Type & Task */}
              <div className="mb-6">
                <h2 className="text-2xl font-hagrid font-light text-ar-white mb-2">
                  {isBreak ? 'Break Time' : selectedSessionType.title}
                </h2>
                {!isBreak && currentTask && (
                  <p className="text-ar-gray-400 text-sm">Working on: {currentTask}</p>
                )}
              </div>

              {/* Timer Display */}
              <motion.div
                className="relative w-64 h-64 mx-auto mb-8"
                animate={{ 
                  rotate: isSessionActive && !isPaused ? 360 : 0 
                }}
                transition={{ 
                  duration: 60, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-ar-gray-700 rounded-full"></div>
                
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="46%"
                    fill="none"
                    stroke={isBreak ? "#10B981" : "#8B5CF6"}
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * (0.46 * 128)}`}
                    strokeDashoffset={`${2 * Math.PI * (0.46 * 128) * (1 - (timeRemaining / (selectedSessionType.duration)))}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                
                {/* Timer text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-4xl font-light text-ar-white mb-2">
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-ar-gray-400">
                      {isBreak ? 'Break' : 'Focus'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Controls */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={pauseSession}
                  className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                
                <button
                  onClick={stopSession}
                  className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
                >
                  <RotateCcw size={20} />
                </button>
                
                {isBreak && (
                  <button
                    onClick={skipBreak}
                    className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors"
                  >
                    <SkipForward size={20} />
                  </button>
                )}
              </div>

              {/* Motivational Text */}
              <div className="text-ar-gray-400 text-sm italic">
                {isBreak 
                  ? "Rest your mind, you've earned it."
                  : isPaused 
                  ? "Take your time, we'll wait."
                  : "Every second counts. Stay focused."
                }
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === 'setup') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Focus Session Setup</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Session Type Selection */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">Choose Session Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedSessionType(type)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedSessionType.id === type.id
                      ? `${type.color} text-white scale-105`
                      : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                  }`}
                >
                  <h3 className="font-hagrid font-light mb-2">{type.title}</h3>
                  <p className="text-sm opacity-80">{type.description}</p>
                </button>
              ))}
            </div>

            {selectedSessionType.id === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-2">
                  Custom Duration (minutes)
                </label>
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  min="5"
                  max="180"
                  className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Task/Goal Input */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">What will you work on?</h2>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="Enter your task or goal..."
              className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Background Sound Selection */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">Background Sound</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {backgroundSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setSelectedSound(sound.id)}
                  className={`p-3 rounded-xl text-sm transition-all ${
                    selectedSound === sound.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                  }`}
                >
                  <div className="font-hagrid font-light">{sound.title}</div>
                  <div className="text-xs opacity-80">{sound.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Session Button */}
          <div className="text-center">
            <button
              onClick={() => {
                startSession()
                setActiveSection('session')
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white px-12 py-4 rounded-xl text-lg font-hagrid font-light transition-colors shadow-lg hover:shadow-xl"
            >
              Start Focus Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === 'settings') {
    return (
      <div className="max-w-4xl mx-auto pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => setActiveSection('overview')}
            className="text-ar-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hagrid font-light text-ar-white">Focus Settings</h1>
        </motion.div>

        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-hagrid font-light text-ar-white mb-6">Daily Goal Settings</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-3">
              Daily Focus Goal (minutes)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {dailyGoalOptions.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setDailyGoal(minutes)}
                  className={`p-3 rounded-xl transition-all ${
                    dailyGoal === minutes
                      ? 'bg-purple-600 text-white'
                      : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-ar-gray-800/50 rounded-xl">
            <p className="text-ar-gray-400 text-sm">
              💡 <strong>Smart Suggestion:</strong> You usually focus for {Math.floor(dailyProgress * 1.2)} minutes. 
              Want to set your goal to {Math.floor(dailyProgress * 1.2) + 10} minutes?
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-hagrid font-light text-ar-white mb-2">Deep Focus Mode</h1>
        <p className="text-ar-gray-400 text-lg font-hagrid font-light">Build discipline. Enter flow. Conquer distractions.</p>
      </motion.div>

      {/* Daily Progress & Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Daily Goal Progress */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-hagrid font-light text-ar-white">Today's Goal</h3>
            <Target className="text-purple-400" size={20} />
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ar-gray-400">Progress</span>
              <span className="text-purple-400 font-medium">{dailyProgress}/{dailyGoal} min</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-3">
              <div 
                className="bg-purple-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-ar-gray-400">
            {getProgressPercentage() >= 100 ? '🎉 Goal achieved!' : `${Math.round(getProgressPercentage())}% completed`}
          </p>
        </div>

        {/* Focus Streak */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-hagrid font-light text-ar-white">Focus Streak</h3>
            <Flame className="text-orange-400" size={20} />
          </div>
          <div className="flex items-center gap-3 mb-3">
            {getStreakIcon()}
            <span className="text-2xl font-light text-ar-white">{focusStreak}</span>
            <span className="text-ar-gray-400">days</span>
          </div>
          <p className="text-xs text-ar-gray-400">
            Keep going! Streak continues when daily goal is met
          </p>
        </div>

        {/* Level & XP */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-hagrid font-light text-ar-white">Level {level}</h3>
            <Star className="text-yellow-400" size={20} />
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ar-gray-400">XP</span>
              <span className="text-yellow-400 font-medium">{getCurrentLevelXP()}/{getXPForNextLevel()}</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(getCurrentLevelXP() / getXPForNextLevel()) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-ar-gray-400">
            Total: {totalXP.toLocaleString()} XP
          </p>
        </div>
      </motion.div>

      {/* Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Start Focus Session */}
        <div 
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('setup')}
        >
          <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <Play size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Start Session</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Begin your focus journey</p>
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl transition-colors">
            Focus Now
          </button>
        </div>

        {/* Quick Pomodoro */}
        <div 
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            setSelectedSessionType(sessionTypes[0])
            startSession()
            setActiveSection('session')
          }}
        >
          <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Quick Pomodoro</h3>
          <p className="text-ar-gray-400 text-sm mb-4">25 min instant start</p>
          <button className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl transition-colors">
            Start 25 min
          </button>
        </div>

        {/* Focus Settings */}
        <div 
          className="glass-card p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActiveSection('settings')}
        >
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Settings size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">Settings</h3>
          <p className="text-ar-gray-400 text-sm mb-4">Customize your goals</p>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors">
            Configure
          </button>
        </div>

        {/* Progress Analytics */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="text-xl font-hagrid font-light text-ar-white mb-2">This Week</h3>
          <p className="text-ar-gray-400 text-sm mb-4">450 min vs Last week: 320 min</p>
          <div className="w-full bg-ar-gray-800 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h2 className="text-xl font-hagrid font-light text-ar-white mb-4">Recent Sessions</h2>
        {completedSessions.length > 0 ? (
          <div className="space-y-3">
            {completedSessions.slice(-5).reverse().map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-ar-gray-800/50 rounded-xl">
                <div>
                  <p className="text-ar-white font-hagrid font-light">{session.task || 'Focused session'}</p>
                  <p className="text-ar-gray-400 text-sm">{session.duration} minutes • +{session.xpGained} XP</p>
                </div>
                <div className="text-ar-gray-400 text-sm">
                  {session.completedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="text-ar-gray-600 mx-auto mb-3" size={32} />
            <p className="text-ar-gray-400">No sessions yet. Start your first focus session!</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
