import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTaskStore } from "../../store/taskStore"

const tags = [
  { id: 'study', label: 'Study', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'work', label: 'Work', color: 'bg-red-500/20 text-red-300' },
  { id: 'reading', label: 'Reading', color: 'bg-green-500/20 text-green-300' },
  { id: 'selfcare', label: 'Self-Care', color: 'bg-purple-500/20 text-purple-300' },
  { id: 'routine', label: 'Routine', color: 'bg-orange-500/20 text-orange-300' },
  { id: 'personalwork', label: 'Personal Work', color: 'bg-indigo-500/20 text-indigo-300' },
]

export default function EditTaskModal({ isOpen, onClose, task }) {
  const { updateTask } = useTaskStore()

  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
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

  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDate(task.date || new Date().toISOString().slice(0,10))
      setStart(task.startAt ? new Date(task.startAt).toISOString().slice(11,16) : "09:00")
      setEnd(task.endAt ? new Date(task.endAt).toISOString().slice(11,16) : "10:00")
      setTag(task.tag || 'study')
      setFocusMode(Boolean(task.focusMode))
      setFocusDuration(task.focusDuration || 25)
      setBreakDuration(task.breakDuration || 5)
      setCycles(task.cycles || 1)
    }
  }, [task])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!task) return
    const startAt = new Date(`${date}T${start}:00`).getTime()
    const endAt = new Date(`${date}T${end}:00`).getTime()
    updateTask(task.id, { title, date, startAt, endAt, tag, focusMode, focusDuration, breakDuration, cycles })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md max-h-[90vh] glass-card rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 pb-0">
              <h3 className="text-xl font-hagrid font-light text-ar-white">Edit Task</h3>
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
                <div className="pt-2">
                  <button type="submit" className="w-full bg-ar-blue hover:bg-ar-blue-light text-white rounded-md py-3">Save Changes</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


