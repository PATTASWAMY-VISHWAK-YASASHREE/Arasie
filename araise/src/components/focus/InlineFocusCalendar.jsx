import { useState, useMemo } from "react"
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
  const { focusTasks } = useUserStore()

  const { calendarDays, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().slice(0, 10)
      const tasksForDay = focusTasks.filter(task => task.date === dateStr)
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === new Date().toISOString().slice(0, 10),
        tasks: tasksForDay
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return {
      calendarDays: days,
      monthYear: `${MONTHS[month]} ${year}`
    }
  }, [currentDate, focusTasks])

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
            `}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              if (day.tasks.length > 0 && onTaskSelect) {
                onTaskSelect(day.tasks[0])
              }
            }}
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
            
            {/* Task Indicators */}
            {day.tasks.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {day.tasks.slice(0, 2).map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className={`w-1.5 h-1.5 rounded-full ${getTaskColor(task)}`}
                    title={task.title || task.name}
                  />
                ))}
                {day.tasks.length > 2 && (
                  <div className="text-xs text-ar-gray-400">+{day.tasks.length - 2}</div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Today's Tasks Preview */}
      {(() => {
        const today = new Date().toISOString().slice(0, 10)
        const todayTasks = focusTasks.filter(task => task.date === today)
        
        if (todayTasks.length === 0) return null
        
        return (
          <div className="mt-4 pt-4 border-t border-ar-gray-700">
            <div className="text-sm font-medium text-ar-white mb-2">Today's Tasks</div>
            <div className="space-y-2">
              {todayTasks.slice(0, 3).map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-ar-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getTaskColor(task)}`} />
                    <span className="text-sm text-ar-white">{task.title || task.name}</span>
                  </div>
                  
                  {task.startTime && (
                    <div className="flex items-center gap-1 text-xs text-ar-gray-400">
                      <Clock size={12} />
                      {task.startTime}
                    </div>
                  )}
                  
                  {onTaskSelect && (
                    <button
                      onClick={() => onTaskSelect(task)}
                      className="p-1 hover:bg-ar-gray-700 rounded transition-colors"
                    >
                      <Play size={12} className="text-ar-blue" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}