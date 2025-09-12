import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useUserStore } from "../../store/userStore"
import { Clock, Target, TrendingUp, Calendar } from "lucide-react"

export default function FocusProgressGraph() {
  const { focusLogs = [], focusTasks = [], isAuthenticated } = useUserStore()
  const [timeRange, setTimeRange] = useState('week') // 'week', 'month', 'year'
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHours: 0,
    avgSessionLength: 0,
    completionRate: 0,
    streak: 0
  })

  // Generate chart data based on time range
  const generateChartData = useCallback(() => {
    const now = new Date()
    let days = 7
    let format = 'MMM DD'
    
    switch (timeRange) {
      case 'week':
        days = 7
        format = 'ddd'
        break
      case 'month':
        days = 30
        format = 'MMM DD'
        break
      case 'year':
        days = 365
        format = 'MMM'
        break
    }

    const data = []
    
    // Ensure arrays exist before filtering
    const safeFocusLogs = focusLogs || []
    const safeFocusTasks = focusTasks || []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      
      // Get focus sessions for this date
      const dayLogs = safeFocusLogs.filter(log => 
        log.time && log.time.slice(0, 10) === dateStr && log.completed
      )
      
      // Get completed tasks for this date
      const dayTasks = safeFocusTasks.filter(task => 
        task.date === dateStr && task.status === 'completed'
      )
      
      // Calculate total minutes
      const sessionMinutes = dayLogs.reduce((total, log) => total + log.duration, 0)
      const taskMinutes = dayTasks.reduce((total, task) => total + task.planned, 0)
      const totalMinutes = sessionMinutes + taskMinutes
      
      // Format date label
      let label
      if (timeRange === 'week') {
        label = date.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (timeRange === 'month') {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short' })
      }
      
      data.push({
        date: dateStr,
        label,
        minutes: totalMinutes,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
        sessions: dayLogs.length + dayTasks.length,
        sessionMinutes,
        taskMinutes
      })
    }
    
    return data
  }, [focusLogs, focusTasks, timeRange])

  // Calculate statistics
  const calculateStats = useCallback(() => {
    // Ensure arrays exist before filtering
    const safeFocusLogs = focusLogs || []
    const safeFocusTasks = focusTasks || []
    
    const completedSessions = safeFocusLogs.filter(log => log.completed)
    const completedTasks = safeFocusTasks.filter(task => task.status === 'completed')
    
    // Total hours
    const sessionMinutes = completedSessions.reduce((total, log) => total + log.duration, 0)
    const taskMinutes = completedTasks.reduce((total, task) => total + task.planned, 0)
    const totalMinutes = sessionMinutes + taskMinutes
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10
    
    // Average session length
    const totalSessions = completedSessions.length + completedTasks.length
    const avgSessionLength = totalSessions > 0 
      ? Math.round((totalMinutes / totalSessions) * 10) / 10 
      : 0
    
    // Completion rate (completed vs total tasks)
    const totalTasks = safeFocusTasks.length
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks.length / totalTasks) * 100) 
      : 0
    
    // Calculate streak (consecutive days with focus activity)
    const focusLogDates = completedSessions.map(log => log.time.slice(0, 10))
    const taskDates = completedTasks.map(task => task.date)
    const allDates = [...new Set([...focusLogDates, ...taskDates])].sort()
    
    let streak = 0
    if (allDates.length > 0) {
      const today = new Date().toISOString().slice(0, 10)
      
      // Check if today has activity
      if (allDates.includes(today)) {
        streak = 1
        // Check consecutive days backwards
        let checkDate = new Date(Date.now() - 86400000)
        while (allDates.includes(checkDate.toISOString().slice(0, 10))) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        }
      } else {
        // Check if yesterday had activity (streak might continue tomorrow)
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        if (allDates.includes(yesterday)) {
          streak = 1
          let checkDate = new Date(Date.now() - 2 * 86400000)
          while (allDates.includes(checkDate.toISOString().slice(0, 10))) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          }
        }
      }
    }
    
    return {
      totalHours,
      avgSessionLength,
      completionRate,
      streak
    }
  }, [focusLogs, focusTasks])

  // Update data when dependencies change
  useEffect(() => {
    if (isAuthenticated !== null && focusLogs !== undefined && focusTasks !== undefined) { // Wait for auth state and data to be determined
      try {
        setChartData(generateChartData())
        setStats(calculateStats())
        setIsLoading(false)
      } catch (error) {
        console.error('Error updating chart data:', error)
        setIsLoading(false)
      }
    }
  }, [generateChartData, calculateStats, isAuthenticated])

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-ar-gray-400">Loading focus data...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-ar-gray-800 border border-ar-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-ar-white font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-purple-400">
              Focus Time: {data.hours}h ({data.minutes}m)
            </p>
            <p className="text-blue-400">
              Sessions: {data.sessions}
            </p>
            {data.sessionMinutes > 0 && (
              <p className="text-green-400">
                Quick Sessions: {data.sessionMinutes}m
              </p>
            )}
            {data.taskMinutes > 0 && (
              <p className="text-yellow-400">
                Custom Tasks: {data.taskMinutes}m
              </p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-hagrid font-light text-ar-white mb-1">
            Focus Progress
          </h2>
          <p className="text-ar-gray-400 text-sm">
            Track your focus sessions and productivity trends
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-ar-gray-800 rounded-lg p-1">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm transition-colors capitalize ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'text-ar-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-ar-gray-800/50 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Clock size={16} />
          </div>
          <div className="text-lg font-light text-ar-white">{stats.totalHours}h</div>
          <div className="text-xs text-ar-gray-400">Total Focus</div>
        </div>
        
        <div className="bg-ar-gray-800/50 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target size={16} />
          </div>
          <div className="text-lg font-light text-ar-white">{stats.avgSessionLength}m</div>
          <div className="text-xs text-ar-gray-400">Avg Session</div>
        </div>
        
        <div className="bg-ar-gray-800/50 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={16} />
          </div>
          <div className="text-lg font-light text-ar-white">{stats.completionRate}%</div>
          <div className="text-xs text-ar-gray-400">Completion</div>
        </div>
        
        <div className="bg-ar-gray-800/50 rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Calendar size={16} />
          </div>
          <div className="text-lg font-light text-ar-white">{stats.streak}</div>
          <div className="text-xs text-ar-gray-400">Day Streak</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="label" 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickLine={false}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#focusGradient)"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#1F2937' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-ar-gray-400 mb-2">No focus data yet</div>
              <p className="text-ar-gray-500 text-sm">Start your first focus session to see your progress!</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {chartData.length > 0 && (
        <div className="mt-4 p-4 bg-ar-gray-800/30 rounded-xl">
          <h3 className="text-sm font-medium text-ar-white mb-2">Insights</h3>
          <div className="text-xs text-ar-gray-400 space-y-1">
            {stats.streak > 0 && (
              <p>🔥 You're on a {stats.streak}-day focus streak! Keep it up!</p>
            )}
            {stats.avgSessionLength > 45 && (
              <p>💪 Great focus endurance with {stats.avgSessionLength}m average sessions</p>
            )}
            {stats.completionRate > 80 && (
              <p>🎯 Excellent task completion rate at {stats.completionRate}%</p>
            )}
            {stats.totalHours > 10 && (
              <p>⭐ You've focused for {stats.totalHours} hours total - amazing dedication!</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}