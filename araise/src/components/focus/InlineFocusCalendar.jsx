import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Clock, Play } from "lucide-react"
import { useUserStore } from "../../store/userStore"

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function InlineFocusCalendar({ onTaskSelect, className = "" }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const { focusTasks } = useUserStore()

  // Update current time every minute for real-time task status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const { calendarDays, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = currentTime.toISOString().slice(0, 10)
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().slice(0, 10)
      const tasksForDay = focusTasks.filter(task => task.date === dateStr)
      
      // Check for active tasks (tasks happening right now)
      const activeTasks = tasksForDay.filter(task => {
        if (!task.startTime || !task.endTime || dateStr !== today) return false
        
        const [startHour, startMin] = task.startTime.split(':').map(Number)
        const [endHour, endMin] = task.endTime.split(':').map(Number)
        const currentHour = currentTime.getHours()
        const currentMin = currentTime.getMinutes()

        const startTime = startHour * 60 + startMin
        const endTime = endHour * 60 + endMin
        const nowTime = currentHour * 60 + currentMin

        return nowTime >= startTime && nowTime <= endTime
      })
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === today,
        tasks: tasksForDay,
        activeTasks: activeTasks,
        hasActiveTasks: activeTasks.length > 0
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return {
      calendarDays: days,
      monthYear: `${MONTHS[month]} ${year}`
    }
  }, [currentDate, focusTasks, currentTime])

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const getTaskColor = (task) => {
    const colors = {
      study: 'bg-ar-blue',
      work: 'bg-ar-green',
      reading: 'bg-ar-violet',
      selfcare: 'bg-ar-pink',
      routine: 'bg-ar-yellow',
      personalwork: 'bg-ar-orange'
    }
    return colors[task.category] || 'bg-ar-gray-500'
  }

  return (
    <div className={`glass-card p-4 rounded-xl border border-ar-gray-700/60 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-hagrid font-light text-ar-white">
          Focus Calendar
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} className="text-ar-gray-400" />
          </button>
          
          <div className="text-sm font-medium text-ar-white min-w-[120px] text-center">
            {monthYear}
          </div>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={16} className="text-ar-gray-400" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-xs text-ar-gray-400 text-center py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <motion.div
            key={index}
            className={`
              relative p-2 rounded-lg cursor-pointer transition-colors min-h-[40px]
              ${
                day.isCurrentMonth
                  ? 'hover:bg-ar-gray-700/50'
                  : 'opacity-40'
              }
              ${
                day.isToday
                  ? 'bg-ar-blue/20 border border-ar-blue/40'
                  : ''
              }
              ${
                day.hasActiveTasks
                  ? 'ring-2 ring-ar-green-500 bg-ar-green-500/10'
                  : ''
              }
            `}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              if (day.tasks.length > 0 && onTaskSelect) {
                // Prioritize active tasks
                const taskToSelect = day.hasActiveTasks ? day.activeTasks[0] : day.tasks[0]
                onTaskSelect(taskToSelect)
              }
            }}
            animate={day.hasActiveTasks ? {
              boxShadow: [
                '0 0 0 2px rgba(34, 197, 94, 0.3)',
                '0 0 0 4px rgba(34, 197, 94, 0.1)',
                '0 0 0 2px rgba(34, 197, 94, 0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: day.hasActiveTasks ? Infinity : 0 }}
          >
            <div className={`
              text-xs text-center
              ${
                day.isCurrentMonth
                  ? day.isToday
                    ? 'text-ar-blue font-medium'
                    : 'text-ar-white'
                  : 'text-ar-gray-500'
              }
            `}>
              {day.date.getDate()}
            </div>
            
            {/* Active Task Indicator */}
            {day.hasActiveTasks && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-ar-green-500 rounded-full animate-pulse"></div>
            )}
            
            {/* Task Indicators */}
            {day.tasks.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {day.tasks.slice(0, 2).map((task, taskIndex) => {
                  const isActiveTask = day.activeTasks.includes(task)
                  return (
                    <div
                      key={taskIndex}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActiveTask ? 'bg-ar-green-500' : getTaskColor(task)
                      } ${isActiveTask ? 'animate-pulse' : ''}`}
                      title={`${task.title || task.name}${isActiveTask ? ' (Active Now)' : ''}`}
                    />
                  )
                })}
                {day.tasks.length > 2 && (
                  <div className="text-xs text-ar-gray-400">+{day.tasks.length - 2}</div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Today's Tasks Preview with Real-time Status */}
      {(() => {
        const today = currentTime.toISOString().slice(0, 10)
        const todayTasks = focusTasks.filter(task => task.date === today)
        
        if (todayTasks.length === 0) return null
        
        // Sort tasks by time, with active tasks first
        const sortedTasks = todayTasks.sort((a, b) => {
          const aActive = a.startTime && a.endTime && (() => {
            const [startHour, startMin] = a.startTime.split(':').map(Number)
            const [endHour, endMin] = a.endTime.split(':').map(Number)
            const currentHour = currentTime.getHours()
            const currentMin = currentTime.getMinutes()
            const startTime = startHour * 60 + startMin
            const endTime = endHour * 60 + endMin
            const nowTime = currentHour * 60 + currentMin
            return nowTime >= startTime && nowTime <= endTime
          })()
          
          const bActive = b.startTime && b.endTime && (() => {
            const [startHour, startMin] = b.startTime.split(':').map(Number)
            const [endHour, endMin] = b.endTime.split(':').map(Number)
            const currentHour = currentTime.getHours()
            const currentMin = currentTime.getMinutes()
            const startTime = startHour * 60 + startMin
            const endTime = endHour * 60 + endMin
            const nowTime = currentHour * 60 + currentMin
            return nowTime >= startTime && nowTime <= endTime
          })()
          
          if (aActive && !bActive) return -1
          if (!aActive && bActive) return 1
          
          // Sort by start time if both have times
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime)
          }
          
          return 0
        })
        
        return (
          <div className="mt-4 pt-4 border-t border-ar-gray-700">
            <div className="text-sm font-medium text-ar-white mb-2 flex items-center gap-2">
              Today's Tasks
              <div className="text-xs text-ar-gray-400">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
            </div>
            <div className="space-y-2">
              {sortedTasks.slice(0, 3).map((task, index) => {
                // Check if task is currently active
                const isActive = task.startTime && task.endTime && (() => {
                  const [startHour, startMin] = task.startTime.split(':').map(Number)
                  const [endHour, endMin] = task.endTime.split(':').map(Number)
                  const currentHour = currentTime.getHours()
                  const currentMin = currentTime.getMinutes()
                  const startTime = startHour * 60 + startMin
                  const endTime = endHour * 60 + endMin
                  const nowTime = currentHour * 60 + currentMin
                  return nowTime >= startTime && nowTime <= endTime
                })()
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-ar-green-500/20 border border-ar-green-500/30' 
                        : 'bg-ar-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-ar-green-500 animate-pulse' : getTaskColor(task)
                      }`} />
                      <span className={`text-sm ${
                        isActive ? 'text-ar-green-400 font-medium' : 'text-ar-white'
                      }`}>
                        {task.title || task.name}
                        {isActive && <span className="ml-2 text-xs">(Active)</span>}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.startTime && (
                        <div className={`flex items-center gap-1 text-xs ${
                          isActive ? 'text-ar-green-400' : 'text-ar-gray-400'
                        }`}>
                          <Clock size={12} />
                          {task.startTime}
                        </div>
                      )}
                      
                      {onTaskSelect && (
                        <button
                          onClick={() => onTaskSelect(task)}
                          className={`p-1 rounded transition-colors ${
                            isActive 
                              ? 'hover:bg-ar-green-700 text-ar-green-400' 
                              : 'hover:bg-ar-gray-700 text-ar-blue'
                          }`}
                        >
                          <Play size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}