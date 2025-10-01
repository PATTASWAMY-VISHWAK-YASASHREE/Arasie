import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save } from "lucide-react"

export default function EditTaskModal({ isOpen, onClose, task, onSave }) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("study")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [focusMode, setFocusMode] = useState(true)

  useEffect(() => {
    if (task) {
      setTitle(task.title || task.name || "")
      setCategory(task.category || "study")
      setStartTime(task.startTime || "")
      setEndTime(task.endTime || "")
      setFocusMode(task.focusMode !== false)
    }
  }, [task])

  const handleSave = () => {
    if (!title.trim()) return

    const updatedTask = {
      ...task,
      title: title.trim(),
      name: title.trim(),
      category,
      startTime,
      endTime,
      focusMode
    }

    onSave(updatedTask)
    onClose()
  }

  const handleClose = () => {
    // Reset form
    setTitle("")
    setCategory("study")
    setStartTime("")
    setEndTime("")
    setFocusMode(true)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="glass-card p-6 rounded-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-hagrid font-light text-ar-white">Edit Task</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-ar-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full p-3 bg-ar-gray-800 border border-ar-gray-700 rounded-lg text-ar-white placeholder-ar-gray-500 focus:border-ar-blue focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-ar-gray-800 border border-ar-gray-700 rounded-lg text-ar-white focus:border-ar-blue focus:outline-none"
                >
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="reading">Reading</option>
                  <option value="selfcare">Self-Care</option>
                  <option value="routine">Routine</option>
                  <option value="personalwork">Personal Work</option>
                </select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 bg-ar-gray-800 border border-ar-gray-700 rounded-lg text-ar-white focus:border-ar-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ar-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 bg-ar-gray-800 border border-ar-gray-700 rounded-lg text-ar-white focus:border-ar-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Focus Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ar-gray-300">Focus Mode</div>
                  <div className="text-xs text-ar-gray-500">Enable focus session for this task</div>
                </div>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    focusMode ? 'bg-ar-blue' : 'bg-ar-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      focusMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 px-4 py-3 bg-ar-blue hover:bg-ar-blue-600 disabled:bg-ar-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}