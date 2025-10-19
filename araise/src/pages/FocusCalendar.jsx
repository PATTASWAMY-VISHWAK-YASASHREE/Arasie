import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Play, Edit2, Trash2, Plus } from "lucide-react"
import { useUserStore } from "../store/userStore"
import AddTaskModal from "../components/focus/AddTaskModal"
import DeleteTaskModal from "../components/focus/DeleteTaskModal"


export default function FocusCalendar() {
  const navigate = useNavigate()
  const { focusTasks, updateFocusTaskProgress, deleteFocusTask, deleteFocusTaskSeries } = useUserStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)


  // Get current week dates
  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day // First day is Sunday
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek)
      weekDate.setDate(startOfWeek.getDate() + i)
      week.push(weekDate)
    }
    return week
  }

  const weekDates = getWeekDates(currentDate)
  const today = new Date().toISOString().split('T')[0]

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return (focusTasks || []).filter(task => task.date === dateStr)
      .sort((a, b) => {
        if (!a.startTime && !b.startTime) return 0
        if (!a.startTime) return 1
        if (!b.startTime) return -1
        return a.startTime.localeCompare(b.startTime)
      })
  }

  const handleToggleComplete = async (task) => {
    if (task.status === 'completed') {
      await updateFocusTaskProgress(task.id, 0)
    } else {
      const duration = task.planned || task.focusDuration || 25
      await updateFocusTaskProgress(task.id, duration)
    }
  }

  const handleDeleteTask = (task) => {
    setDeletingTask(task)
  }

  const handleDeleteThis = async (taskId) => {
    await deleteFocusTask(taskId)
  }

  const handleDeleteSeries = async (taskId) => {
    await deleteFocusTaskSeries(taskId)
  }



  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  return (
    <div className="min-h-screen bg-ar-black">
      <div className="max-w-7xl mx-auto px-3 py-4 md:px-4 md:py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 md:w-12 md:h-12 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={18} className="text-ar-blue md:w-5 md:h-5" />
          </button>
          <h1 className="text-ar-white text-lg md:text-xl font-hagrid font-light flex-1 text-center">Focus Schedule</h1>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-2 py-2 md:px-3 md:py-2 rounded bg-ar-blue text-white hover:bg-ar-blue-600 transition-colors flex items-center gap-1 md:gap-2 flex-shrink-0 text-xs md:text-sm"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-ar-gray-900/50 rounded-xl p-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-lg bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-ar-white font-medium">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-lg bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0]
            const isToday = dateStr === today
            const dayTasks = getTasksForDate(date)
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNumber = date.getDate()

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-xl p-4 ${isToday ? 'ring-2 ring-ar-blue-500' : ''}`}
              >
                {/* Day Header */}
                <div className="text-center mb-4">
                  <div className="text-ar-gray-400 text-sm">{dayName}</div>
                  <div className={`text-lg font-medium ${isToday ? 'text-ar-blue-400' : 'text-ar-white'}`}>
                    {dayNumber}
                  </div>
                </div>

                {/* Tasks for this day */}
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <div className="text-ar-gray-500 text-sm text-center py-4">
                      No tasks
                    </div>
                  ) : (
                    dayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-ar-gray-800/50 rounded-lg p-3 hover:bg-ar-gray-800/70 transition-colors"
                      >
                        {/* Time */}
                        {task.startTime && task.endTime && (
                          <div className="flex items-center gap-1 text-ar-blue-400 text-xs mb-1">
                            <Clock size={10} />
                            <span>{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
                          </div>
                        )}

                        {/* Task Title and Actions Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                task.status === 'completed'
                                  ? 'bg-ar-blue-500 border-ar-blue-500 text-white'
                                  : 'border-ar-gray-500'
                              }`}
                            >
                              {task.status === 'completed' && (
                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <span className={`text-sm font-medium ${
                              task.status === 'completed' 
                                ? 'text-ar-gray-400 line-through' 
                                : 'text-ar-white'
                            }`}>
                              {task.title || task.name}
                            </span>
                          </div>

                          {/* Actions - Moved to right side */}
                          <div className="flex items-center gap-1">
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => setEditingTask(task)}
                                className="p-1 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-gray-300 rounded text-xs"
                                title="Edit Task"
                              >
                                <Edit2 size={10} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="p-1 bg-ar-red-600 hover:bg-ar-red-500 text-white rounded text-xs"
                              title={task.isRepeating || task.originalTaskId ? "Delete Task (Repeated)" : "Delete Task"}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="text-xs text-ar-gray-400">
                          {task.category || 'study'}
                          {task.focusMode !== false && ' • Focus'}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Modals */}
        <AddTaskModal 
          isOpen={isAddOpen} 
          onClose={() => setIsAddOpen(false)} 
        />
        <AddTaskModal 
          isOpen={!!editingTask} 
          onClose={() => setEditingTask(null)}
          editTask={editingTask}
        />
        <DeleteTaskModal
          isOpen={!!deletingTask}
          onClose={() => setDeletingTask(null)}
          task={deletingTask}
          onDeleteThis={handleDeleteThis}
          onDeleteSeries={handleDeleteSeries}
        />

      </div>
    </div>
  )
}


