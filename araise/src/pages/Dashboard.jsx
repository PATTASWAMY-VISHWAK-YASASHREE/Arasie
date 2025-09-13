import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Flame, Target, Trophy, Heart, Brain } from "lucide-react"
import { useUserStore } from "../store/userStore"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import WaterBottle from "../components/WaterBottle"


// Motivational quotes
const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success is what comes after you stop making excuses.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Don't stop when you're tired. Stop when you're done."
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [currentQuote, setCurrentQuote] = useState(0)
  const { currentUser, loading } = useAuth()
  
  const {
    name,
    level,
    streakCount,
    isAuthenticated,
    getStreakStats,
    calendar,
    checkStreak,
    loadFocusTasks,
    focusProgress,
    mentalHealthProgress,
    waterProgress,
    workoutCompleted,
    dietGoalMet,
    meals
  } = useUserStore()

  // Immediate authentication check - don't render anything if not properly authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ar-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or no current user or guest, don't render anything - let ProtectedRoute handle redirect
  if (!loading && (!isAuthenticated || !currentUser || name === 'Guest')) {
    return null // Return nothing, let the ProtectedRoute component handle the redirect
  }

  // Real-time progress stats with live updates
  const [progressStats, setProgressStats] = useState({
    workout: 0,
    water: 0,
    diet: 0,
    mentalHealth: 0,
    focus: 0
  })
  const streakStats = getStreakStats()

  // Update progress stats in real-time (only when data actually changes)
  useEffect(() => {
    setProgressStats({
      workout: workoutCompleted ? 100 : 0,
      water: Math.min((waterProgress / 3000) * 100, 100), // 3000ml = 3L goal
      diet: dietGoalMet ? 100 : Math.min((meals.length / 3) * 100, 100), // Show gradual progress based on meals logged
      mentalHealth: mentalHealthProgress,
      focus: focusProgress
    })
  }, [workoutCompleted, waterProgress, dietGoalMet, mentalHealthProgress, focusProgress, meals.length])

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check for streak updates every few seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await checkStreak()
    }, 3000)
    return () => clearInterval(interval)
  }, [checkStreak])

  // Load focus data on mount
  useEffect(() => {
    // Initial load
    if (typeof loadFocusTasks === 'function') {
      loadFocusTasks().catch(error => {
        console.error('Error loading focus tasks:', error)
      })
    }
  }, [loadFocusTasks])

  // Radar chart data (Pentagon with 5 axes) - memoized to prevent flickering
  const radarData = useMemo(() => [
    { subject: 'Workout', progress: progressStats.workout, fullMark: 100 },
    { subject: 'Diet', progress: progressStats.diet, fullMark: 100 },
    { subject: 'Water', progress: progressStats.water, fullMark: 100 },
    { subject: 'Mental Health', progress: progressStats.mentalHealth, fullMark: 100 },
    { subject: 'Focus', progress: progressStats.focus, fullMark: 100 },
  ], [progressStats.workout, progressStats.diet, progressStats.water, progressStats.mentalHealth, progressStats.focus])

  // Generate calendar heatmap (last 35 days - 5 weeks)
  const generateCalendar = () => {
    const days = []
    const today = new Date()
    
    for (let i = 34; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      const dayData = calendar.find(c => c.date === dateStr)
      
      days.push({
        date: dateStr,
        completed: dayData?.completed || false,
        day: date.getDate(),
        isToday: dateStr === today.toISOString().slice(0, 10)
      })
    }
    
    return days
  }

  const calendarDays = generateCalendar()

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 pt-6">
      {/* Top Section - Greeting, Level, Streak */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-hagrid font-light text-ar-white mb-2 tracking-tight">
            Hello, {name}!
          </h1>
          <motion.p 
            className="text-ar-gray-400 text-lg italic font-hagrid font-light"
            key={currentQuote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            "{quotes[currentQuote]}"
          </motion.p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div className="bg-ar-blue text-ar-white px-6 py-2 rounded-full font-hagrid font-light text-lg shadow-card-hover">
            Level {level}
          </div>
          
          {/* Streak Counter */}
          <div className="flex items-center gap-2 text-ar-green">
            <div className="relative">
              <Flame size={28} className="text-ar-green" />
              {streakCount > 0 && (
                <motion.div
                  className="absolute inset-0 text-ar-green/50"
                  animate={{ 
                    opacity: [0.3, 0.7, 0.3] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <Flame size={28} />
                </motion.div>
              )}
            </div>
            <span className="text-2xl font-hagrid font-light">{streakCount}</span>
            <span className="text-sm text-ar-gray-400 font-hagrid font-light">day streak</span>
          </div>
        </div>
      </motion.div>

      {/* Middle Section - Radar Chart, Calendar & Water Bottle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-6">
        {/* Progress Radar Chart */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-hagrid font-light mb-3 md:mb-4 text-center tracking-tight">Today's Progress</h2>
          <div className="h-80 md:h-96 flex items-center justify-center">
            <ResponsiveContainer width="98%" height="98%">
              <RadarChart data={radarData} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                <PolarGrid gridType="polygon" stroke="#22D2FF" strokeWidth={0.5} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#D4D4D4', fontSize: 14, fontWeight: 'light', fontFamily: 'Hagrid' }}
                  tickOffset={20}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Progress"
                  dataKey="progress"
                  stroke="#22D2FF"
                  fill="#22D2FF"
                  fillOpacity={0.3}
                  strokeWidth={3}
                  dot={{ fill: '#A55EEA', strokeWidth: 2, r: 6 }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Streak Calendar Heatmap */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-hagrid font-light mb-4 md:mb-6 text-center tracking-tight">Streak Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={`${day}-${index}`} className="text-center text-sm text-ar-gray-400 font-hagrid font-light">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <motion.div
                key={index}
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-hagrid font-light
                  ${day.completed 
                    ? 'bg-ar-blue border-ar-blue text-ar-white shadow-card-hover' 
                    : day.isToday
                    ? 'border-ar-green text-ar-green'
                    : 'border-ar-gray-700 text-ar-gray-500'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {day.day}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-ar-gray-400 font-hagrid font-light">
            <span className="text-ar-blue font-medium">{streakStats.thisWeek}/7</span> days completed this week
          </div>
        </motion.div>

        {/* Water Bottle Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <WaterBottle />
        </motion.div>
      </div>

      {/* Bottom Section - Micro Action Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Workout Card */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/workout')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Target className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Workout</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Train your body</p>
            </div>
          </div>
          <div className="mb-3 md:mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <span className="text-red-400 font-medium">{Math.round(progressStats.workout)}%</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-2 md:h-3">
              <div 
                className="bg-red-400 h-2 md:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.workout}%` }}
              />
            </div>
          </div>
          <button className="w-full bg-red-500 hover:bg-red-400 text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover">
            {progressStats.workout === 100 ? 'Completed ✓' : 'Start Training'}
          </button>
        </motion.div>

        {/* Diet Card */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/diet')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="p-3 bg-ar-green/20 rounded-xl">
              <Trophy className="text-ar-green" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Diet</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Fuel your body</p>
            </div>
          </div>
          <div className="mb-3 md:mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <span className="text-ar-green font-medium">{Math.round(progressStats.diet)}%</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-2 md:h-3">
              <div 
                className="bg-ar-green h-2 md:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.diet}%` }}
              />
            </div>
          </div>
          <button className="w-full bg-ar-green hover:bg-ar-green-light text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover">
            {progressStats.diet >= 100 ? 'Goals Met ✓' : 'Log Meal'}
          </button>
        </motion.div>

        {/* Mental Health Card */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/mental-health')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Heart className="text-purple-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Mental Health</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Mind wellness</p>
            </div>
          </div>
          <div className="mb-3 md:mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <span className="text-purple-400 font-medium">{Math.round(progressStats.mentalHealth)}%</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-2 md:h-3">
              <div 
                className="bg-purple-400 h-2 md:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.mentalHealth}%` }}
              />
            </div>
          </div>
          <button className="w-full bg-purple-500 hover:bg-purple-400 text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover">
            {progressStats.mentalHealth >= 100 ? 'Complete ✓' : 'Check-in'}
          </button>
        </motion.div>

        {/* Focus Card */}
        <motion.div
          className="glass-card p-4 md:p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/focus')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{ 
            borderColor: progressStats.focus === 100 ? '#3b82f6' : 'transparent'
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <motion.div 
              className="p-3 bg-blue-500/20 rounded-xl"
              animate={{ 
                backgroundColor: progressStats.focus === 100 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
              }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="text-blue-400" size={24} />
            </motion.div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Focus</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Deep work</p>
            </div>
            {progressStats.focus > 0 && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
                title="Active Progress"
              />
            )}
          </div>
          <div className="mb-3 md:mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <motion.span 
                className="text-blue-400 font-medium"
                animate={{ 
                  scale: progressStats.focus === 100 ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(progressStats.focus)}%
              </motion.span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-2 md:h-3 overflow-hidden">
              <motion.div 
                className="bg-blue-400 h-2 md:h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressStats.focus}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <motion.button 
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover"
            animate={{ 
              backgroundColor: progressStats.focus >= 100 ? '#22c55e' : '#3b82f6'
            }}
            transition={{ duration: 0.5 }}
          >
            {progressStats.focus >= 100 ? 'Goal Met ✓' : 'Start Session'}
          </motion.button>
        </motion.div>
      </motion.div>




    </div>
  )
}
