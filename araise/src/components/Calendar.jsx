import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../store/userStore"

export default function Calendar() {
  const navigate = useNavigate()
  const { calendar } = useUserStore()
  
  // Initialize with current date (October 2025)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)) // October 1, 2025
  const today = new Date(2025, 9, 1) // Force today to be October 1, 2025

  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysInMonth = lastDayOfMonth.getDate()

  // Create calendar grid (6 weeks = 42 days)
  const calendarDays = []
  
  // Add previous month days to fill first week
  // Get the last day of previous month to know how many days it has
  const lastDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
  const daysInPrevMonth = lastDayOfPrevMonth.getDate() // September has 30 days
  
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day)
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false
    })
  }
  
  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    calendarDays.push({
      date,
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false
    })
  }
  
  // Debug: Log the first few dates to verify correctness
  console.log('📅 Calendar Debug:')
  console.log('Days in previous month (September):', daysInPrevMonth)
  console.log('First day weekday:', firstDayWeekday)
  console.log('First 7 calendar dates:')
  calendarDays.slice(0, 7).forEach((dayObj, index) => {
    console.log(`  ${index}: ${dayObj.date.toDateString()} (day ${dayObj.day})`)
  })
  
  // Add next month days to fill remaining slots (up to 42 total)
  const remainingSlots = 42 - calendarDays.length
  for (let day = 1; day <= remainingSlots; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day)
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true
    })
  }

  // Helper functions
  const handleDateClick = (date) => {
    // Use a more reliable date formatting to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    console.log('🔗 Navigating to date:', dateStr, 'from clicked date:', date.toDateString())
    navigate(`/history/${dateStr}`)
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const isDateCompleted = (date) => {
    // Use the same reliable date formatting as handleDateClick to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    const isCompleted = calendar.some(entry => entry.date === dateStr && entry.completed)
    
    // Debug completion check
    if (date.getDate() <= 3 && date.getMonth() === 9) { // October 1-3
      console.log(`🟢 Completion check for ${dateStr} (${date.toDateString()}):`, isCompleted)
      console.log('Calendar entries:', calendar.filter(entry => entry.date.includes('2025-10')))
    }
    
    return isCompleted
  }

  const isDateClickable = (date) => {
    return date <= today
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <div className="glass-card p-4 md:p-6 rounded-2xl">
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goToPrevMonth}
          className="p-2 text-ar-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-ar-white font-medium text-lg">
            {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          
          {/* Today button - only show if not viewing current month */}
          {(currentDate.getMonth() !== today.getMonth() || currentDate.getFullYear() !== today.getFullYear()) && (
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs bg-ar-blue text-white rounded-full hover:bg-ar-blue/80 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 text-ar-gray-300 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-ar-gray-400 text-sm font-medium py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((dayObj, index) => {
          const { date, day, isCurrentMonth, isPrevMonth, isNextMonth } = dayObj
          const clickable = isDateClickable(date)
          const completed = isDateCompleted(date)
          const todayDate = isToday(date)
          
          return (
            <motion.button
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              onClick={() => clickable && handleDateClick(date)}
              disabled={!clickable}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                ${clickable 
                  ? 'cursor-pointer hover:scale-105' 
                  : 'cursor-not-allowed opacity-30'
                }
                ${!isCurrentMonth 
                  ? 'opacity-50 bg-ar-gray-800/30 text-ar-gray-500 hover:bg-ar-gray-700/30'
                  : completed 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : clickable 
                      ? 'bg-ar-gray-800/60 text-ar-gray-200 hover:bg-ar-gray-700/60' 
                      : 'bg-ar-gray-900/30 text-ar-gray-600'
                }
                ${todayDate ? 'ring-2 ring-ar-blue' : ''}
              `}
              whileHover={clickable ? { scale: 1.05 } : {}}
              whileTap={clickable ? { scale: 0.95 } : {}}
            >
              {day}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-ar-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
          <span>Goals Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-ar-gray-800/60"></div>
          <span>Available Days</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-ar-gray-900/30"></div>
          <span>Before Account Creation</span>
        </div>
      </div>
    </div>
  )
}