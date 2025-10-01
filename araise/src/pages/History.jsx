import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Dumbbell, RefreshCw } from "lucide-react"
import { useUserStore } from "../store/userStore"
import WaterHistoryBox from "../components/history/WaterHistoryBox"
import DietHistoryBox from "../components/history/DietHistoryBox"
import WorkoutHistoryBox from "../components/history/WorkoutHistoryBox"
import FocusHistoryBox from "../components/history/FocusHistoryBox"
import MentalWellnessHistoryBox from "../components/history/MentalWellnessHistoryBox"

export default function History() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { firebaseService } = useUserStore()
  const [activities, setActivities] = useState({
    water: [],
    diet: [],
    workout: [],
    focus: [],
    mentalWellness: []
  })
  const [loading, setLoading] = useState(true)
  const [expandedBox, setExpandedBox] = useState(null)


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
          
          <div className="w-8"></div> {/* Spacer for layout balance */}
        </div>

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