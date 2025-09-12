import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Target, 
  Play, 
  Plus,
  Clock,
  Crosshair,
  Award,
  Flame,
  Trash2,
  Zap,
  PlayCircle,
  CheckCircle2
} from "lucide-react"
import { useUserStore } from "../../store/userStore"

export default function FocusDashboard({ onStartSession, onCreateCustom, refreshTrigger }) {
  const { name, focusLogs = [], focusTasks = [], deleteFocusTask, loadFocusTasks, updateFocusProgress, focusProgress } = useUserStore()
  
  // Custom tasks from Firebase/localStorage
  const [activeTasks, setActiveTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  
  // Real-time progress tracking for active sessions
  const [realTimeProgress, setRealTimeProgress] = useState({})

  // Calculate today's progress (after state declarations)
  const today = new Date().toISOString().slice(0, 10)
  const todaysSessions = focusLogs.filter(log => 
    log.time.slice(0, 10) === today && log.completed
  )
  
  // Also count sessions from completed tasks
  const completedTaskSessions = completedTasks.length
  const totalSessions = todaysSessions.length + completedTaskSessions
  
  // Use the same focus progress calculation as the main dashboard
  const plannedMinutes = 60 // 1 hour default goal (same as main dashboard)
  const completedMinutes = Math.floor((focusProgress / 100) * plannedMinutes) // Convert percentage back to minutes
  const remainingMinutes = Math.max(0, plannedMinutes - completedMinutes)

  // Calculate focus statistics using both focusLogs and focusTasks
  const calculateFocusStats = () => {
    // Get all completed tasks from store (with safety check)
    const safeFocusTasks = focusTasks || []
    const safeFocusLogs = focusLogs || []
    const allCompletedTasks = safeFocusTasks.filter(task => task.status === 'completed')

    // Combine focusLogs and completed tasks
    const completedSessions = safeFocusLogs.filter(log => log.completed)
    
    // Total focus time (focusLogs + completed tasks)
    const focusLogMinutes = completedSessions.reduce((total, session) => total + session.duration, 0)
    const taskMinutes = allCompletedTasks.reduce((total, task) => total + task.planned, 0)
    const totalMinutes = focusLogMinutes + taskMinutes
    const totalHours = Math.floor(totalMinutes / 60)
    const totalMins = totalMinutes % 60
    
    // Total sessions count (focusLogs + completed tasks)
    const totalSessionsCount = completedSessions.length + allCompletedTasks.length
    
    // Longest session (check both sources)
    const focusLogLongest = completedSessions.length > 0 
      ? Math.max(...completedSessions.map(log => log.duration))
      : 0
    const taskLongest = allCompletedTasks.length > 0
      ? Math.max(...allCompletedTasks.map(task => task.planned))
      : 0
    const longestSession = Math.max(focusLogLongest, taskLongest)
    
    // Calculate streak using both sources
    const focusLogDates = completedSessions.map(log => log.time.slice(0, 10))
    const taskDates = allCompletedTasks.map(task => task.date)
    const allDates = [...new Set([...focusLogDates, ...taskDates])].sort()
    
    let currentStreak = 0
    if (allDates.length > 0) {
      const todayDate = new Date().toISOString().slice(0, 10)
      
      // Check if today has any completed sessions/tasks
      if (allDates.includes(todayDate)) {
        currentStreak = 1
        // Check consecutive days backwards
        let checkDate = new Date(Date.now() - 86400000)
        while (allDates.includes(checkDate.toISOString().slice(0, 10))) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        }
      } else {
        // Check if yesterday had sessions (streak might continue tomorrow)
        const yesterdayDate = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        if (allDates.includes(yesterdayDate)) {
          currentStreak = 1
          let checkDate = new Date(Date.now() - 2 * 86400000)
          while (allDates.includes(checkDate.toISOString().slice(0, 10))) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          }
        }
      }
    }
    
    return {
      totalHours,
      totalMins,
      totalSessions: totalSessionsCount,
      longestSession,
      currentStreak
    }
  }

  // Recalculate stats when tasks change
  const [stats, setStats] = useState({
    totalHours: 0,
    totalMins: 0,
    totalSessions: 0,
    longestSession: 0,
    currentStreak: 0
  })

  // Update stats when tasks or focusLogs change
  useEffect(() => {
    setStats(calculateFocusStats())
  }, [activeTasks, completedTasks, focusLogs])

  // Load custom tasks from Firebase/localStorage
  const loadCustomTasks = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      
      // Separate active and completed tasks for today
      const safeFocusTasks = focusTasks || []
      const todaysTasks = safeFocusTasks.filter(task => task.date === today)
      const active = todaysTasks.filter(task => task.status !== 'completed')
      const completed = todaysTasks.filter(task => task.status === 'completed')
      
      setActiveTasks(active)
      setCompletedTasks(completed)
    } catch (error) {
      console.error('Error loading custom tasks:', error)
      setActiveTasks([])
      setCompletedTasks([])
    }
  }

  // Update local tasks when focusTasks or refreshTrigger changes
  useEffect(() => {
    loadCustomTasks()
  }, [refreshTrigger]) // Only reload when refreshTrigger changes

  // Separate effect to update tasks when focusTasks data changes
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    const safeFocusTasks = focusTasks || []
    const todaysTasks = safeFocusTasks.filter(task => task.date === today)
    const active = todaysTasks.filter(task => task.status !== 'completed')
    const completed = todaysTasks.filter(task => task.status === 'completed')
    
    setActiveTasks(active)
    setCompletedTasks(completed)
    
    // Update real-time progress with actual task progress
    const newRealTimeProgress = {}
    todaysTasks.forEach(task => {
      newRealTimeProgress[task.id] = task.completed
    })
    setRealTimeProgress(newRealTimeProgress)
  }, [focusTasks])

  // Set up real-time progress updates by listening to localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('focus-session-')) {
        try {
          const sessionData = JSON.parse(e.newValue || '{}')
          if (sessionData.taskId && sessionData.timeSpentInCurrentPhase) {
            const minutesSpent = Math.floor(sessionData.timeSpentInCurrentPhase / 60)
            const task = activeTasks.find(t => t.id === sessionData.taskId)
            if (task) {
              setRealTimeProgress(prev => ({
                ...prev,
                [sessionData.taskId]: task.completed + minutesSpent
              }))
            }
          }
        } catch (error) {
          console.error('Error parsing session data:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [activeTasks])

  // Set up interval to check for active sessions and update progress
  useEffect(() => {
    const interval = setInterval(() => {
      // Check localStorage for active sessions
      const keys = Object.keys(localStorage)
      const sessionKeys = keys.filter(key => key.startsWith('focus-session-'))
      
      let hasActiveSession = false
      sessionKeys.forEach(key => {
        try {
          const sessionData = JSON.parse(localStorage.getItem(key) || '{}')
          if (sessionData.taskId && sessionData.timeSpentInCurrentPhase) {
            hasActiveSession = true
            const minutesSpent = Math.floor(sessionData.timeSpentInCurrentPhase / 60)
            const task = activeTasks.find(t => t.id === sessionData.taskId)
            if (task) {
              setRealTimeProgress(prev => ({
                ...prev,
                [sessionData.taskId]: task.completed + minutesSpent
              }))
            }
          }
        } catch (error) {
          console.error('Error parsing session data:', error)
        }
      })
      
      // If there's an active session, trigger a refresh to sync with main dashboard
      if (hasActiveSession) {
        // This will cause the component to re-render with updated focusProgress
        // The focusProgress comes from the userStore which is updated by the LiveSession
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [activeTasks]) // Update when focusTasks changes

  // Also reload when component becomes visible (when returning from other views)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCustomTasks()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])



  // Delete task
  const deleteTask = async (taskId) => {
    try {
      if (typeof deleteFocusTask === 'function') {
        await deleteFocusTask(taskId)
      }
      
      // Reload tasks to update both active and completed lists
      await loadCustomTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // Get real-time progress for a task
  const getRealTimeProgress = (task) => {
    const realTimeCompleted = realTimeProgress[task.id] || task.completed
    return Math.min(realTimeCompleted, task.planned)
  }

  // Get real-time progress percentage
  const getRealTimeProgressPercentage = (task) => {
    const realTimeCompleted = getRealTimeProgress(task)
    return Math.min((realTimeCompleted / task.planned) * 100, 100)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-progress': 
        return <PlayCircle className="text-blue-400" size={24} />
      case 'completed': 
        return <CheckCircle2 className="text-green-400" size={24} />
      case 'upcoming': 
        return <Zap className="text-purple-400" size={24} />
      default: 
        return <Zap className="text-purple-400" size={24} />
    }
  }

  const getProgressPercentage = () => {
    return focusProgress // Use the main dashboard's focus progress directly
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-hagrid font-light text-ar-white tracking-tight">
            Hi {name}, ready to focus?
          </h1>
          <p className="text-ar-gray-400 text-lg font-light max-w-2xl mx-auto">
            Transform your productivity with focused work sessions. Every minute counts towards your goals.
          </p>

        </div>
        
        {/* Today's Goal Progress */}
        <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto border border-ar-gray-700/50 hover:border-ar-gray-600/50 transition-all duration-300">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-hagrid font-light text-ar-white mb-1">Today's Goal</h3>
                  {focusProgress > 0 && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Synced with main dashboard" />
                  )}
                </div>
                <p className="text-ar-gray-400 text-sm">Stay consistent, build momentum</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-light text-ar-white mb-1">
                  {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m
                </div>
                <div className="text-purple-400 text-sm font-medium">
                  of {Math.floor(plannedMinutes / 60)}h planned
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-ar-gray-400">Progress</span>
                <span className="text-purple-400 font-medium">{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-ar-gray-800 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-4 rounded-full transition-all duration-700 ease-out shadow-lg shadow-purple-500/20"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
      >
        {/* Total Focus */}
        <div className="glass-card p-4 md:p-8 rounded-2xl md:rounded-3xl text-center border border-ar-gray-700/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-purple-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300">
            <Clock size={20} className="md:hidden" />
            <Clock size={28} className="hidden md:block" />
          </div>
          <div className="text-xl md:text-3xl font-light text-ar-white mb-1 md:mb-2 tracking-tight">
            {stats.totalHours}h{stats.totalMins > 0 && ` ${stats.totalMins}m`}
          </div>
          <div className="text-ar-gray-400 text-xs md:text-sm font-medium">Total Focus</div>
        </div>

        {/* Sessions */}
        <div className="glass-card p-4 md:p-8 rounded-2xl md:rounded-3xl text-center border border-ar-gray-700/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300">
            <Crosshair size={20} className="md:hidden" />
            <Crosshair size={28} className="hidden md:block" />
          </div>
          <div className="text-xl md:text-3xl font-light text-ar-white mb-1 md:mb-2 tracking-tight">
            {stats.totalSessions}
          </div>
          <div className="text-ar-gray-400 text-xs md:text-sm font-medium">Sessions</div>
        </div>

        {/* Longest Session */}
        <div className="glass-card p-4 md:p-8 rounded-2xl md:rounded-3xl text-center border border-ar-gray-700/50 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 group">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300">
            <Award size={20} className="md:hidden" />
            <Award size={28} className="hidden md:block" />
          </div>
          <div className="text-xl md:text-3xl font-light text-ar-white mb-1 md:mb-2 tracking-tight">
            {stats.longestSession}m
          </div>
          <div className="text-ar-gray-400 text-xs md:text-sm font-medium">Longest Session</div>
        </div>

        {/* Day Streak */}
        <div className="glass-card p-4 md:p-8 rounded-2xl md:rounded-3xl text-center border border-ar-gray-700/50 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-orange-400 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-transform duration-300">
            <Flame size={20} className="md:hidden" />
            <Flame size={28} className="hidden md:block" />
          </div>
          <div className="text-xl md:text-3xl font-light text-ar-white mb-1 md:mb-2 tracking-tight">
            {stats.currentStreak}
          </div>
          <div className="text-ar-gray-400 text-xs md:text-sm font-medium">Day Streak</div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 max-w-lg md:max-w-2xl mx-auto"
      >
        <button
          onClick={() => onStartSession('pomodoro')}
          className="glass-card p-6 md:p-8 rounded-2xl hover:scale-105 transition-all group"
        >
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-red-500/30 transition-colors">
              <Target size={24} className="md:hidden" />
              <Target size={32} className="hidden md:block" />
            </div>
            <h3 className="text-lg md:text-xl font-hagrid font-light text-ar-white mb-1 md:mb-2">Quick Focus</h3>
            <p className="text-ar-gray-400 text-xs md:text-sm">25m (default Pomodoro)</p>
          </div>
        </button>

        <button
          onClick={onCreateCustom}
          className="glass-card p-6 md:p-8 rounded-2xl hover:scale-105 transition-all group"
        >
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-purple-500/30 transition-colors">
              <Plus size={24} className="md:hidden" />
              <Plus size={32} className="hidden md:block" />
            </div>
            <h3 className="text-lg md:text-xl font-hagrid font-light text-ar-white mb-1 md:mb-2">Custom Session</h3>
            <p className="text-ar-gray-400 text-xs md:text-sm">Create own task</p>
          </div>
        </button>
      </motion.div>

      {/* Today's Focus List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 rounded-2xl"
      >
        <h2 className="text-xl font-hagrid font-light text-ar-white mb-6">Today's Focus List</h2>
        
        <div className="space-y-4">
          {activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <div key={task.id} className="group p-6 bg-ar-gray-800/30 hover:bg-ar-gray-800/50 border border-ar-gray-700/50 hover:border-ar-gray-600/50 rounded-2xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-hagrid font-light text-ar-white">{task.name}</h3>
                        {/* Active session indicator */}
                        {realTimeProgress[task.id] > task.completed && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Active session" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(task.status === 'in-progress' || task.status === 'upcoming') && task.completed < task.planned && (
                          <button
                            onClick={() => onStartSession('custom', task)}
                            className="p-2 bg-transparent hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-lg transition-colors"
                            title="Start session"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 bg-transparent hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-ar-gray-400 text-sm">
                        {task.planned}m planned • {Math.max(0, task.planned - getRealTimeProgress(task))}m left
                      </span>
                      <span className="text-ar-gray-300 text-sm font-medium">
                        {Math.round(getRealTimeProgressPercentage(task))}%
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-ar-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${getRealTimeProgressPercentage(task)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-ar-gray-400 mb-4">No custom tasks yet</div>
              <button
                onClick={onCreateCustom}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Create Your First Task
              </button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        {(activeTasks.length > 0 || completedTasks.length > 0) && (
          <div className="mt-6 pt-6 border-t border-ar-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-light text-ar-white">{Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m</div>
                <div className="text-ar-gray-400 text-sm">Completed Today</div>
              </div>
              <div>
                <div className="text-2xl font-light text-ar-white">{totalSessions}</div>
                <div className="text-ar-gray-400 text-sm">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-light text-ar-white">
                  {completedTasks.length}/{activeTasks.length + completedTasks.length}
                </div>
                <div className="text-ar-gray-400 text-sm">Tasks Done</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Completed Tasks History */}
      {completedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 rounded-2xl"
        >
          <h2 className="text-xl font-hagrid font-light text-ar-white mb-6">Completed Today</h2>
          
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div key={task.id} className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-hagrid font-light text-ar-white">{task.name}</h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-400" size={20} />
                    <span className="text-green-400 text-sm font-medium">Completed</span>
                  </div>
                </div>
                
                <p className="text-ar-gray-400 text-sm mb-2">
                  {task.planned}m completed • {task.lastUpdated ? new Date(task.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Today'}
                </p>
                
                {task.completionDescription && (
                  <p className="text-ar-gray-300 text-sm italic bg-ar-gray-800/30 p-3 rounded-lg border-l-2 border-green-400/30">
                    "{task.completionDescription}"
                  </p>
                )}
                
                {/* Completed progress bar */}
                <div className="w-full bg-ar-gray-700 rounded-full h-2 mt-3">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}