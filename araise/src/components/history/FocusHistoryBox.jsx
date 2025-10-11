import { motion } from "framer-motion"
import { Brain, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Target } from "lucide-react"

export default function FocusHistoryBox({ activities, isExpanded, onToggle }) {
  // Filter tasks by focus mode and completion status
  const focusTasks = activities.filter(task => task.focusMode !== false)
  const nonFocusTasks = activities.filter(task => task.focusMode === false)
  
  const completedFocusTasks = focusTasks.filter(task => task.status === 'completed')
  const uncompletedFocusTasks = focusTasks.filter(task => task.status !== 'completed')
  
  const completedNonFocusTasks = nonFocusTasks.filter(task => task.status === 'completed')
  const uncompletedNonFocusTasks = nonFocusTasks.filter(task => task.status !== 'completed')
  
  const totalTasks = activities.length
  const totalCompletedTasks = activities.filter(task => task.status === 'completed').length
  
  // Calculate total time from completed tasks
  const totalFocusTime = completedFocusTasks.reduce((sum, task) => {
    return sum + (task.completed || task.planned || task.focusDuration || 25)
  }, 0)

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <motion.div
      layout
      className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-ar-gray-800/40 transition-colors"
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Brain className="text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="text-ar-white font-medium">Focus Tasks</h3>
            <p className="text-ar-gray-400 text-sm">
              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} • {formatDuration(totalFocusTime)} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ar-gray-300 text-sm">
            {totalCompletedTasks} completed
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-ar-gray-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="text-green-400" size={16} />
            <span className="text-ar-white text-sm">Focused</span>
          </div>
          <p className="text-green-400 font-medium">{completedFocusTasks.length}</p>
        </div>
        <div className="bg-ar-gray-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="text-red-400" size={16} />
            <span className="text-ar-white text-sm">Uncompleted</span>
          </div>
          <p className="text-red-400 font-medium">{activities.filter(task => task.status !== 'completed').length}</p>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-ar-gray-700 pt-4"
        >
          <h4 className="text-ar-white font-medium mb-3">Task Details</h4>
          {activities.length === 0 ? (
            <p className="text-ar-gray-400 text-sm">No tasks recorded</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {/* Completed Tasks */}
              {totalCompletedTasks > 0 && (
                <div className="space-y-2">
                  <h5 className="text-green-400 text-sm font-medium flex items-center gap-2">
                    <CheckCircle size={16} />
                    Completed Tasks ({totalCompletedTasks})
                  </h5>
                  
                  {/* Completed Focus Tasks */}
                  {completedFocusTasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg ml-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-green-400" size={16} />
                          <div>
                            <span className="text-ar-white text-sm font-medium">
                              {task.title || task.name || 'Focus Task'}
                            </span>
                            <div className="text-ar-gray-400 text-xs">
                              Duration: {formatDuration(task.completed || task.planned || 25)} • Focus Mode
                            </div>
                          </div>
                        </div>
                        {task.startTime && (
                          <div className="flex items-center gap-1 text-ar-gray-400 text-sm">
                            <Clock size={14} />
                            {task.startTime} - {task.endTime}
                          </div>
                        )}
                      </div>
                      <div className="text-ar-gray-300 text-xs ml-7">
                        Category: {task.category || 'study'}
                      </div>
                    </div>
                  ))}
                  
                  {/* Completed Non-Focus Tasks */}
                  {completedNonFocusTasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg ml-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-blue-400" size={16} />
                          <div>
                            <span className="text-ar-white text-sm font-medium">
                              {task.title || task.name || 'Task'}
                            </span>
                            <div className="text-ar-gray-400 text-xs">
                              Regular Task • Completed
                            </div>
                          </div>
                        </div>
                        {task.startTime && (
                          <div className="flex items-center gap-1 text-ar-gray-400 text-sm">
                            <Clock size={14} />
                            {task.startTime} - {task.endTime}
                          </div>
                        )}
                      </div>
                      <div className="text-ar-gray-300 text-xs ml-7">
                        Category: {task.category || 'study'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Uncompleted Tasks */}
              {(uncompletedFocusTasks.length + uncompletedNonFocusTasks.length) > 0 && (
                <div className="space-y-2">
                  <h5 className="text-red-400 text-sm font-medium flex items-center gap-2">
                    <XCircle size={16} />
                    Unfinished Tasks ({uncompletedFocusTasks.length + uncompletedNonFocusTasks.length})
                  </h5>
                  
                  {/* Unfinished Focus Tasks */}
                  {uncompletedFocusTasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg ml-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <XCircle className="text-red-400" size={16} />
                          <div>
                            <span className="text-ar-white text-sm font-medium">
                              {task.title || task.name || 'Focus Task'}
                            </span>
                            <div className="text-ar-gray-400 text-xs">
                              Planned: {formatDuration(task.planned || 25)} • Focus Mode • Incomplete
                            </div>
                          </div>
                        </div>
                        {task.startTime && (
                          <div className="flex items-center gap-1 text-ar-gray-400 text-sm">
                            <Clock size={14} />
                            {task.startTime} - {task.endTime}
                          </div>
                        )}
                      </div>
                      <div className="text-ar-gray-300 text-xs ml-7">
                        Category: {task.category || 'study'}
                      </div>
                    </div>
                  ))}
                  
                  {/* Unfinished Non-Focus Tasks */}
                  {uncompletedNonFocusTasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg ml-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <XCircle className="text-orange-400" size={16} />
                          <div>
                            <span className="text-ar-white text-sm font-medium">
                              {task.title || task.name || 'Task'}
                            </span>
                            <div className="text-ar-gray-400 text-xs">
                              Regular Task • Incomplete
                            </div>
                          </div>
                        </div>
                        {task.startTime && (
                          <div className="flex items-center gap-1 text-ar-gray-400 text-sm">
                            <Clock size={14} />
                            {task.startTime} - {task.endTime}
                          </div>
                        )}
                      </div>
                      <div className="text-ar-gray-300 text-xs ml-7">
                        Category: {task.category || 'study'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}