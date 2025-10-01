import { motion } from "framer-motion"
import { Clock, Play, Edit2, Trash2, Tag } from "lucide-react"
import { useUserStore } from "../../store/userStore"
import { useState } from "react"
import AddTaskModal from "./AddTaskModal"

export default function TimeBlockedList({ onStart }) {
  const { focusTasks, updateFocusTaskProgress, deleteFocusTask } = useUserStore()
  const [editingTask, setEditingTask] = useState(null)
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Helper function to format time - defined first so it can be used in sorting
  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return null
    const [hours, minutes] = timeString.split(':')
    if (!hours || !minutes) return null
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get all tasks for today (not just time-blocked ones)
  const todaysTasks = (focusTasks || []).filter(task => 
    task && task.date === today
  )

  // Sort tasks by start time, putting tasks without valid time at the end
  const sortedTasks = todaysTasks.sort((a, b) => {
    const aHasValidTime = a.startTime && a.startTime.trim() !== '' && formatTime(a.startTime)
    const bHasValidTime = b.startTime && b.startTime.trim() !== '' && formatTime(b.startTime)
    
    if (!aHasValidTime && !bHasValidTime) return 0
    if (!aHasValidTime) return 1
    if (!bHasValidTime) return -1
    
    const timeA = a.startTime.replace(':', '')
    const timeB = b.startTime.replace(':', '')
    return timeA.localeCompare(timeB)
  })

  const handleToggleComplete = async (task) => {
    if (task.status === 'completed') {
      // If already completed, mark as pending
      await updateFocusTaskProgress(task.id, 0)
    } else {
      // Mark as completed with full duration
      const duration = task.planned || task.focusDuration || 25
      await updateFocusTaskProgress(task.id, duration)
    }
  }

  const handleStartTask = (task) => {
    if (onStart) {
      onStart(task)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteFocusTask(taskId)
    }
  }

  const completedCount = todaysTasks.filter(task => task.status === 'completed').length
  const totalCount = todaysTasks.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-hagrid font-light text-ar-white">
          Today's Task List
        </h3>
        <div className="text-ar-gray-400 text-sm">
          Remaining {totalCount - completedCount}/{totalCount}
        </div>
      </div>
      
      {sortedTasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 text-center"
        >
          <div className="text-ar-gray-300 mb-4">
            <Clock size={48} className="mx-auto mb-4 text-ar-gray-500" />
            <h4 className="text-lg font-medium mb-2">No Tasks Today</h4>
            <p className="text-sm text-ar-gray-400">
              Create focus tasks to see them here.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.3,
                ease: "easeOut"
              }}
              className="glass-card rounded-xl p-4 hover:bg-ar-gray-800/50 transition-all duration-200"
            >
              {/* Time Display - Show for any task with valid time blocks */}
              {task.startTime && task.endTime && 
               task.startTime.trim() !== '' && task.endTime.trim() !== '' &&
               formatTime(task.startTime) && formatTime(task.endTime) && (
                <div className="flex items-center gap-2 text-ar-gray-400 text-sm mb-3">
                  <Clock size={16} />
                  <span>{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Left side - Checkbox and Task Info */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      task.status === 'completed'
                        ? 'bg-ar-blue-500 border-ar-blue-500 text-white scale-110'
                        : 'border-ar-gray-500 hover:border-ar-blue-400 hover:scale-105'
                    }`}
                  >
                    {task.status === 'completed' && (
                      <motion.svg 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1">
                    {/* Task Title - Prominently displayed */}
                    <h4 className={`text-lg font-medium mb-1 transition-all duration-200 ${
                      task.status === 'completed' 
                        ? 'text-ar-gray-400 line-through' 
                        : 'text-ar-white'
                    }`}>
                      {task.title || task.name || 'Untitled Task'}
                    </h4>
                    
                    {/* Tags */}
                    <div className="flex items-center gap-2 text-ar-gray-400 text-sm">
                      <Tag size={12} />
                      <span>
                        {task.category || 'study'}
                        {task.focusMode !== false && ' • Focus'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex items-center gap-2">
                  {task.status !== 'completed' && task.focusMode !== false && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartTask(task)}
                      className="w-12 h-12 bg-ar-blue-500 hover:bg-ar-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Start Focus Session"
                    >
                      <Play size={18} />
                    </motion.button>
                  )}
                  
                  {task.status !== 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingTask(task)}
                      className="w-10 h-10 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-gray-300 hover:text-white rounded-full flex items-center justify-center transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 size={16} />
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteTask(task.id)}
                    className="w-10 h-10 bg-ar-red-600 hover:bg-ar-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Edit Task Modal */}
      <AddTaskModal 
        isOpen={!!editingTask} 
        onClose={() => setEditingTask(null)}
        editTask={editingTask}
      />
    </div>
  )
}