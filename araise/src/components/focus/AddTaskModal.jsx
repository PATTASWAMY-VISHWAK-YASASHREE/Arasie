import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useUserStore } from "../../store/userStore"

const tags = [
  { id: 'study', label: 'Study', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'work', label: 'Work', color: 'bg-red-500/20 text-red-300' },
  { id: 'reading', label: 'Reading', color: 'bg-green-500/20 text-green-300' },
  { id: 'selfcare', label: 'Self-Care', color: 'bg-purple-500/20 text-purple-300' },
  { id: 'routine', label: 'Routine', color: 'bg-orange-500/20 text-orange-300' },
  { id: 'personalwork', label: 'Personal Work', color: 'bg-indigo-500/20 text-indigo-300' },
]

export default function AddTaskModal({ isOpen, onClose, editTask = null }) {
  const { saveFocusTask, updateFocusTask } = useUserStore()
  const today = new Date()
  const defaultDate = today.toISOString().slice(0, 10)

  const [title, setTitle] = useState("")
  const [date, setDate] = useState(defaultDate)
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("10:00")
  const [tag, setTag] = useState('study')
  const [focusMode, setFocusMode] = useState(true)
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [cycles, setCycles] = useState(1)

  // Calculate total time block duration in minutes
  const getTotalDuration = () => {
    const startTime = new Date(`2000-01-01T${start}:00`).getTime()
    const endTime = new Date(`2000-01-01T${end}:00`).getTime()
    return Math.max(0, (endTime - startTime) / (1000 * 60))
  }

  const totalDuration = getTotalDuration()
  const cycleDuration = focusDuration + breakDuration
  const possibleCycles = Math.floor(totalDuration / cycleDuration)
  const totalSessionTime = cycles * cycleDuration
  const isOverTime = totalSessionTime > totalDuration
  const [repeat, setRepeat] = useState('none')
  const [repeatUntil, setRepeatUntil] = useState("")

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || editTask.name || "")
      setDate(editTask.date || defaultDate)
      setStart(editTask.startTime || "09:00")
      setEnd(editTask.endTime || "10:00")
      setTag(editTask.category || 'study')
      setFocusMode(editTask.focusMode !== false)
      setFocusDuration(editTask.focusDuration || 25)
      setBreakDuration(editTask.breakDuration || 5)
      setCycles(editTask.cycles || 1)
      setRepeat(editTask.repeat || 'none')
      setRepeatUntil(editTask.repeatUntil || "")
    } else {
      // Reset form for new task
      setTitle("")
      setDate(defaultDate)
      setStart("09:00")
      setEnd("10:00")
      setTag('study')
      setFocusMode(true)
      setFocusDuration(25)
      setBreakDuration(5)
      setCycles(1)
      setRepeat('none')
      setRepeatUntil("")
    }
  }, [editTask, defaultDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const taskData = {
      name: title.trim(),
      title: title.trim(), // Support both name and title
      planned: totalDuration || focusDuration,
      category: tag,
      focusMode,
      focusDuration,
      breakDuration,
      cycles,
      repeat,
      repeatUntil,
      startTime: start,
      endTime: end,
      date: date
    }

    try {
      if (editTask) {
        // Update existing task using the proper update method
        await updateFocusTask(editTask.id, taskData)
      } else {
        // Create new task
        await saveFocusTask(taskData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving focus task:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md max-h-[90vh] glass-card rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-xl font-hagrid font-light text-ar-white">
                {editTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button onClick={onClose} className="p-2 text-ar-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 pt-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm text-ar-gray-400 mb-1">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white" placeholder="Task title" />
                </div>
                <div>
                  <label className="block text-sm text-ar-gray-400 mb-1">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-ar-gray-400 mb-1">Start</label>
                    <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-ar-gray-400 mb-1">End</label>
                    <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-ar-gray-400 mb-1">Tag</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <button type="button" key={t.id} onClick={() => setTag(t.id)} className={`px-3 py-1 rounded-full text-xs ${t.color} ${tag === t.id ? 'ring-2 ring-white/50' : ''}`}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      id="focusMode"
                      type="checkbox"
                      checked={focusMode}
                      onChange={(e) => setFocusMode(e.target.checked)}
                      className="w-4 h-4 text-ar-blue bg-ar-gray-700 border-ar-gray-600 rounded focus:ring-ar-blue focus:ring-2"
                    />
                    <label htmlFor="focusMode" className="text-sm text-ar-gray-300 cursor-pointer">Focus Mode</label>
                  </div>
                  {focusMode && (
                    <div className="pl-6 space-y-3 bg-ar-gray-800/30 rounded-lg p-3">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-ar-gray-400 mb-1">Focus Duration (min)</label>
                            <input
                              type="number"
                              min="1"
                              max="240"
                              value={focusDuration}
                              onChange={(e) => setFocusDuration(Math.max(1, Number(e.target.value) || 1))}
                              className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-md p-2 text-sm text-ar-white"
                              placeholder="25"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-ar-gray-400 mb-1">Break Duration (min)</label>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              value={breakDuration}
                              onChange={(e) => setBreakDuration(Math.max(0, Number(e.target.value) || 0))}
                              className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-md p-2 text-sm text-ar-white"
                              placeholder="5"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-ar-gray-400 mb-1">Cycles</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={cycles}
                            onChange={(e) => setCycles(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full bg-ar-gray-700/60 border border-ar-gray-600 rounded-md p-2 text-sm text-ar-white"
                            placeholder="1"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-ar-gray-400 space-y-1">
                        <div>Time block: {totalDuration} min total</div>
                        <div>Focus session: {focusDuration} min focus + {breakDuration} min break</div>
                        <div>Planned: {cycles} cycle{cycles > 1 ? 's' : ''} = {totalSessionTime} min total</div>
                        {isOverTime && (
                          <div className="text-red-300">
                            ⚠️ {cycles} cycles ({totalSessionTime} min) exceeds time block ({totalDuration} min)
                          </div>
                        )}
                        {!isOverTime && possibleCycles > 0 && (
                          <div className="text-ar-blue-300">
                            ✓ {possibleCycles} cycle{possibleCycles > 1 ? 's' : ''} possible in time block
                          </div>
                        )}
                        {possibleCycles === 0 && totalDuration > 0 && (
                          <div className="text-orange-300">
                            Focus duration ({focusDuration} min) is longer than time block ({totalDuration} min)
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-ar-gray-400 mb-1">Repeat</label>
                  <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white">
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                {repeat !== 'none' && (
                  <div>
                    <label className="block text-sm text-ar-gray-400 mb-1">Repeat Until</label>
                    <input type="date" value={repeatUntil} onChange={(e) => setRepeatUntil(e.target.value)} className="w-full bg-ar-gray-800/60 border border-ar-gray-700 rounded-md p-3 text-sm text-ar-white" />
                    <p className="text-xs text-ar-gray-500 mt-1">
                      Task will repeat {repeat} starting from {new Date(date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <button type="submit" className="w-full bg-ar-blue hover:bg-ar-blue-light text-white rounded-md py-3">
                    {editTask ? 'Update Task' : 'Add Task'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


