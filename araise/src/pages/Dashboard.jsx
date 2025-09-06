import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Flame, Target, Zap, Trophy } from "lucide-react"
import { useUserStore } from "../store/userStore"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

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
    getProgressStats,
    getStreakStats,
    calendar,
    checkStreak
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

  const progressStats = getProgressStats()
  const streakStats = getStreakStats()

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

  // Radar chart data
  const radarData = [
    { subject: 'Workout', progress: progressStats.workout, fullMark: 100 },
    { subject: 'Water', progress: progressStats.water, fullMark: 100 },
    { subject: 'Diet', progress: progressStats.diet, fullMark: 100 },
  ]

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
    <div className="max-w-7xl mx-auto space-y-8 pt-6">
      {/* Top Section - Greeting, Level, Streak */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
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

      {/* Middle Section - Radar Chart & Calendar Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Radar Chart */}
        <motion.div
          className="glass-card p-6 rounded-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-hagrid font-light mb-6 text-center tracking-tight">Today's Progress</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid gridType="polygon" stroke="#22D2FF" strokeWidth={0.5} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#D4D4D4', fontSize: 14, fontWeight: 'light', fontFamily: 'Hagrid' }}
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
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Streak Calendar Heatmap */}
        <motion.div
          className="glass-card p-6 rounded-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-hagrid font-light mb-6 text-center tracking-tight">Streak Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-sm text-ar-gray-400 font-hagrid font-light">
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
      </div>

      {/* Bottom Section - Action Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Workout Card */}
        <motion.div
          className="glass-card p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/workout')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Target className="text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Workout</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Train your body</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <span className="text-red-400 font-medium">{Math.round(progressStats.workout)}%</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-3">
              <div 
                className="bg-red-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.workout}%` }}
              />
            </div>
          </div>
          <button className="w-full bg-red-500 hover:bg-red-400 text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover">
            {progressStats.workout === 100 ? 'Completed ✓' : 'Start Training'}
          </button>
        </motion.div>

        {/* Water Card */}
        <motion.div
          className="glass-card p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/water')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-ar-blue/20 rounded-xl">
              <Zap className="text-ar-blue" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Water</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Stay hydrated</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <span className="text-ar-blue font-medium">{Math.round(progressStats.water)}%</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-3">
              <div 
                className="bg-ar-blue h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.water}%` }}
              />
            </div>
          </div>
          <button className="w-full bg-ar-blue hover:bg-ar-blue-light text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover">
            {progressStats.water >= 100 ? 'Goal Reached ✓' : 'Log Water'}
          </button>
        </motion.div>

        {/* Diet Card */}
        <motion.div
          className="glass-card p-6 rounded-2xl cursor-pointer group"
          onClick={() => navigate('/diet')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-ar-green/20 rounded-xl">
              <Trophy className="text-ar-green" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-hagrid font-light tracking-tight">Diet</h3>
              <p className="text-ar-gray-400 font-hagrid font-light">Fuel your body</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2 font-hagrid font-light">
              <span>Progress</span>
              <span className="text-ar-green font-medium">{Math.round(progressStats.diet)}%</span>
            </div>
            <div className="w-full bg-ar-gray-800 rounded-full h-3">
              <div 
                className="bg-ar-green h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressStats.diet}%` }}
              />
            </div>
          </div>
          <button className="w-full bg-ar-green hover:bg-ar-green-light text-white font-hagrid font-light py-3 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover">
            {progressStats.diet >= 100 ? 'Goals Met ✓' : 'Log Meal'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
