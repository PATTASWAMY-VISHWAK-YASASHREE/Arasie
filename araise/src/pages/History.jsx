import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { useUserStore } from "../store/userStore"
import WaterHistoryBox from "../components/history/WaterHistoryBox"
import DietHistoryBox from "../components/history/DietHistoryBox"
import WorkoutHistoryBox from "../components/history/WorkoutHistoryBox"
import FocusHistoryBox from "../components/history/FocusHistoryBox"
import MentalWellnessHistoryBox from "../components/history/MentalWellnessHistoryBox"

export default function History() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { firebaseService, calendar } = useUserStore()
  const [activities, setActivities] = useState({
    water: [],
    diet: [],
    workout: [],
    focus: [],
    mentalWellness: []
  })
  const [loading, setLoading] = useState(true)
  const [expandedBox, setExpandedBox] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(date || new Date()))


  useEffect(() => {
    loadActivitiesForDate()
  }, [date, firebaseService])

  const loadActivitiesForDate = async () => {
    if (!firebaseService || !date) return

    setLoading(true)
    try {
      const filteredActivities = await firebaseService.getActivitiesForDate(date)
      setActivities(filteredActivities)
    } catch (error) {
      console.error('Error loading activities for date:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleBoxClick = (boxType) => {
    setExpandedBox(expandedBox === boxType ? null : boxType)
  }

  // Calendar data with activity indicators
  const calendarData = useMemo(() => {
    const year = currentCalendarDate.getFullYear()
    const month = currentCalendarDate.getMonth()
    const today = new Date().toISOString().split('T')[0]
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().slice(0, 10)
      const calendarEntry = calendar.find(c => c.date === dateStr)
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === today,
        isSelected: dateStr === date,
        hasActivities: calendarEntry?.completed || false,
        isPast: current < new Date(today),
        isFuture: current > new Date(today)
      })
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentCalendarDate, calendar, date])

  const navigateCalendarMonth = (direction) => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const selectDate = (selectedDate) => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    navigate(`/history/${dateStr}`)
    setShowCalendar(false)
  }

  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0]
    navigate(`/history/${today}`)
    setCurrentCalendarDate(new Date())
    setShowCalendar(false)
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-ar-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ar-black">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ar-gray-800 text-ar-gray-200 border border-ar-gray-700 hover:bg-ar-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 text-ar-white text-xl font-hagrid font-light">
              <Calendar size={24} />
              Daily History
            </div>
            <p className="text-ar-gray-400 text-sm mt-1">
              {formatDate(date)}
            </p>
          </div>
          
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ar-blue text-white hover:bg-ar-blue-600 transition-colors"
          >
            <CalendarDays size={18} />
            {showCalendar ? 'Hide Calendar' : 'Browse Dates'}
          </button>
        </div>

        {/* Dynamic Calendar Overlay */}
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 rounded-2xl"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => navigateCalendarMonth(-1)}
                className="p-2 text-ar-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-ar-white font-medium text-lg">
                  {currentCalendarDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-xs bg-ar-blue text-white rounded-full hover:bg-ar-blue/80 transition-colors"
                >
                  Today
                </button>
              </div>
              
              <button 
                onClick={() => navigateCalendarMonth(1)}
                className="p-2 text-ar-gray-300 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-ar-gray-400 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarData.map((day, index) => (
                <motion.button
                  key={index}
                  onClick={() => selectDate(day.date)}
                  disabled={day.isFuture}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${day.isFuture 
                      ? 'cursor-not-allowed opacity-30' 
                      : 'cursor-pointer hover:scale-105'
                    }
                    ${!day.isCurrentMonth 
                      ? 'opacity-50 bg-ar-gray-800/30 text-ar-gray-500 hover:bg-ar-gray-700/30'
                      : day.hasActivities 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : day.isPast 
                          ? 'bg-ar-gray-800/60 text-ar-gray-200 hover:bg-ar-gray-700/60' 
                          : 'bg-ar-gray-900/30 text-ar-gray-600'
                    }
                    ${day.isToday ? 'ring-2 ring-ar-blue' : ''}
                    ${day.isSelected ? 'ring-2 ring-ar-green bg-ar-green/20' : ''}
                  `}
                  whileHover={!day.isFuture ? { scale: 1.05 } : {}}
                  whileTap={!day.isFuture ? { scale: 0.95 } : {}}
                >
                  {day.date.getDate()}
                </motion.button>
              ))}
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
                <div className="w-3 h-3 rounded bg-ar-green/20 border border-ar-green"></div>
                <span>Selected Date</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Water Intake Box */}
          <motion.div
            layout
            className={`${expandedBox === 'water' ? 'md:col-span-2 xl:col-span-3' : ''}`}
          >
            <WaterHistoryBox
              activities={activities.water}
              isExpanded={expandedBox === 'water'}
              onToggle={() => handleBoxClick('water')}
            />
          </motion.div>

          {/* Diet Box */}
          <motion.div
            layout
            className={`${expandedBox === 'diet' ? 'md:col-span-2 xl:col-span-3' : ''}`}
          >
            <DietHistoryBox
              activities={activities.diet}
              isExpanded={expandedBox === 'diet'}
              onToggle={() => handleBoxClick('diet')}
            />
          </motion.div>

          {/* Workout Box */}
          <motion.div
            layout
            className={`${expandedBox === 'workout' ? 'md:col-span-2 xl:col-span-3' : ''}`}
          >
            <WorkoutHistoryBox
              activities={activities.workout}
              isExpanded={expandedBox === 'workout'}
              onToggle={() => handleBoxClick('workout')}
            />
          </motion.div>

          {/* Focus Box */}
          <motion.div
            layout
            className={`${expandedBox === 'focus' ? 'md:col-span-2 xl:col-span-3' : ''}`}
          >
            <FocusHistoryBox
              activities={activities.focus}
              isExpanded={expandedBox === 'focus'}
              onToggle={() => handleBoxClick('focus')}
            />
          </motion.div>

          {/* Mental Wellness Box */}
          <motion.div
            layout
            className={`${expandedBox === 'mentalWellness' ? 'md:col-span-2 xl:col-span-3' : ''}`}
          >
            <MentalWellnessHistoryBox
              activities={activities.mentalWellness}
              isExpanded={expandedBox === 'mentalWellness'}
              onToggle={() => handleBoxClick('mentalWellness')}
            />
          </motion.div>
        </div>

        {/* Empty State */}
        {Object.values(activities).every(arr => arr.length === 0) && (
          <div className="text-center py-12">
            <div className="text-ar-gray-400 text-lg mb-2">No activities recorded</div>
            <p className="text-ar-gray-500 text-sm">
              No activities were logged on {formatDate(date)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}