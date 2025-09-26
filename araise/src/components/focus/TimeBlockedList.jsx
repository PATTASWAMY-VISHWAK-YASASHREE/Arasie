import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Tag, Edit3, Trash2, Play, CheckSquare, Square } from "lucide-react"
import { useTaskStore } from "../../store/taskStore"
import EditTaskModal from "./EditTaskModal"

function fmt(ms) {
  const d = new Date(ms)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TimeBlockedList({ onStart }) {
  const { tasks, removeTask, toggleTask } = useTaskStore()
  const today = new Date().toISOString().slice(0, 10)
  const [editTask, setEditTask] = useState(null)

  const { scheduled, unscheduled } = useMemo(() => {
    const todays = (tasks || []).filter(t => t.date === today)
    return {
      scheduled: todays.filter(t => t.startAt && t.endAt).sort((a,b) => {
        // Sort completed tasks to bottom
        if (a.done && !b.done) return 1
        if (!a.done && b.done) return -1
        return a.startAt - b.startAt
      }),
      unscheduled: todays.filter(t => !t.startAt || !t.endAt).sort((a,b) => {
        // Sort completed tasks to bottom
        if (a.done && !b.done) return 1
        if (!a.done && b.done) return -1
        return (a.order ?? 0) - (b.order ?? 0)
      })
    }
  }, [tasks, today])

  const allForToday = [...scheduled, ...unscheduled]
  const totalCount = allForToday.length
  const doneCount = allForToday.filter(t => t.done).length
  const remaining = totalCount - doneCount

  return (
    <div className="glass-card p-4 md:p-6 rounded-xl md:rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-hagrid font-light text-ar-white">Today's Task List</h2>
        <div className="text-xs text-ar-gray-300">Remaining {remaining}/{totalCount}</div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {scheduled.map((t) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 6 }} 
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: t.done ? 0.98 : 1,
                backgroundColor: t.done ? 'rgba(34, 197, 94, 0.1)' : 'rgba(31, 41, 55, 0.4)'
              }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.3
              }}
              className={`p-3 border rounded-md transition-all duration-300 ${
                t.done 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-ar-gray-700 bg-ar-gray-800/40 hover:border-ar-gray-600'
              }`}
            >
              <div className="flex items-center md:items-start justify-between gap-2">
                <div className="flex items-center md:items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <motion.button 
                    onClick={() => toggleTask(t.id)} 
                    className={`p-1 md:p-1.5 rounded flex-shrink-0 transition-all duration-300 ${
                      t.done 
                        ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30' 
                        : 'bg-ar-gray-700 text-ar-gray-200 hover:bg-ar-gray-600'
                    }`}
                    title={t.done ? 'Mark as not done' : 'Mark as done'}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      initial={false}
                      animate={{ 
                        scale: t.done ? 1.1 : 1,
                        rotate: t.done ? 360 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {t.done ? <CheckSquare size={14} /> : <Square size={14} />}
                    </motion.div>
                  </motion.button>
                  <div className="min-w-0 flex-1">
                    <motion.div 
                      className="text-[11px] md:text-xs text-ar-gray-400 flex items-center gap-2"
                      animate={{ opacity: t.done ? 0.6 : 1 }}
                    >
                      <Clock size={12} /> {fmt(t.startAt)} – {fmt(t.endAt)}
                    </motion.div>
                    <motion.div 
                      className={`text-sm md:text-base font-medium mt-0.5 truncate transition-all duration-300 ${
                        t.done 
                          ? 'text-green-300 line-through decoration-green-400 decoration-2' 
                          : 'text-ar-white'
                      }`}
                      animate={{ 
                        textDecoration: t.done ? 'line-through' : 'none',
                        opacity: t.done ? 0.7 : 1
                      }}
                    >
                      {t.title}
                    </motion.div>
                    <motion.div 
                      className="text-[11px] md:text-xs text-ar-gray-400 mt-1 flex items-center gap-2"
                      animate={{ opacity: t.done ? 0.5 : 1 }}
                    >
                      <Tag size={12} /> {t.tag}{t.focusMode ? ' • Focus' : ''}
                    </motion.div>
                  </div>
                </div>
                <motion.div 
                  className="flex items-center gap-1 md:gap-2 flex-shrink-0"
                  animate={{ opacity: t.done ? 0.6 : 1 }}
                >
                  {onStart && t.focusMode && !t.done && (
                    <motion.button 
                      onClick={() => onStart({ 
                        task: t, 
                        mode: 'custom', 
                        focusDuration: t.focusDuration || 25, 
                        breakDuration: t.breakDuration || 5,
                        cycles: t.cycles || 1
                      })} 
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-ar-blue hover:bg-ar-blue/80 text-white transition-all duration-300 flex items-center justify-center" 
                      title={`Start Focus Timer: ${t.focusDuration || 25}min focus + ${t.breakDuration || 5}min break (${t.cycles || 1} cycle${(t.cycles || 1) > 1 ? 's' : ''})`}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={14} />
                    </motion.button>
                  )}
                  <motion.button 
                    onClick={() => setEditTask(t)} 
                    className="p-1 md:p-1.5 rounded hover:bg-ar-gray-700 text-ar-gray-300 transition-all duration-300" 
                    title="Edit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 size={14} />
                  </motion.button>
                  <motion.button 
                    onClick={() => removeTask(t.id)} 
                    className="p-1 md:p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-all duration-300" 
                    title="Delete"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {unscheduled.length > 0 && (
        <div className="mt-4 pt-4 border-t border-ar-gray-700">
          <div className="text-sm text-ar-gray-400 mb-2">Unscheduled</div>
          <div className="space-y-2">
            <AnimatePresence>
              {unscheduled.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: t.done ? 0.98 : 1,
                    backgroundColor: t.done ? 'rgba(34, 197, 94, 0.1)' : 'rgba(31, 41, 55, 0.4)'
                  }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    duration: 0.3
                  }}
                  className={`p-3 border rounded-md transition-all duration-300 ${
                    t.done 
                      ? 'border-green-500/30 bg-green-500/5' 
                      : 'border-ar-gray-700 bg-ar-gray-800/40 hover:border-ar-gray-600'
                  }`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/task-id', t.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const srcId = e.dataTransfer.getData('text/task-id')
                    if (srcId && srcId !== t.id) {
                      useTaskStore.getState().reorderUnscheduled(today, srcId, t.id)
                    }
                  }}
                >
                  <div className="flex items-center md:items-start justify-between gap-2">
                    <div className="flex items-center md:items-start gap-2 md:gap-3 flex-1 min-w-0">
                      <motion.button 
                        onClick={() => toggleTask(t.id)} 
                        className={`p-1 md:p-1.5 rounded flex-shrink-0 transition-all duration-300 ${
                          t.done 
                            ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30' 
                            : 'bg-ar-gray-700 text-ar-gray-200 hover:bg-ar-gray-600'
                        }`}
                        title={t.done ? 'Mark as not done' : 'Mark as done'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          initial={false}
                          animate={{ 
                            scale: t.done ? 1.1 : 1,
                            rotate: t.done ? 360 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {t.done ? <CheckSquare size={14} /> : <Square size={14} />}
                        </motion.div>
                      </motion.button>
                      <div className="min-w-0 flex-1">
                        <motion.div 
                          className={`text-sm md:text-base font-medium truncate transition-all duration-300 ${
                            t.done 
                              ? 'text-green-300 line-through decoration-green-400 decoration-2' 
                              : 'text-ar-white'
                          }`}
                          animate={{ 
                            textDecoration: t.done ? 'line-through' : 'none',
                            opacity: t.done ? 0.7 : 1
                          }}
                        >
                          {t.title}
                        </motion.div>
                        <motion.div 
                          className="text-[11px] md:text-xs text-ar-gray-400 mt-1 flex items-center gap-2"
                          animate={{ opacity: t.done ? 0.5 : 1 }}
                        >
                          <Tag size={12} /> {t.tag}{t.focusMode ? ' • Focus' : ''}
                          {t.repeat !== 'none' && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-ar-gray-700 text-ar-gray-300">{t.repeat}{t.repeatUntil ? ` until ${t.repeatUntil}` : ''}</span>
                          )}
                        </motion.div>
                      </div>
                    </div>
                    <motion.div 
                      className="flex items-center gap-1 md:gap-2 flex-shrink-0"
                      animate={{ opacity: t.done ? 0.6 : 1 }}
                    >
                      {onStart && t.focusMode && !t.done && (
                        <motion.button 
                          onClick={() => onStart({ 
                            task: t, 
                            mode: 'custom', 
                            focusDuration: t.focusDuration || 25, 
                            breakDuration: t.breakDuration || 5,
                            cycles: t.cycles || 1
                          })} 
                          className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-ar-blue hover:bg-ar-blue/80 text-white transition-all duration-300 flex items-center justify-center" 
                          title={`Start Focus Timer: ${t.focusDuration || 25}min focus + ${t.breakDuration || 5}min break (${t.cycles || 1} cycle${(t.cycles || 1) > 1 ? 's' : ''})`}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play size={14} />
                        </motion.button>
                      )}
                      <motion.button 
                        onClick={() => setEditTask(t)} 
                        className="p-1 md:p-1.5 rounded hover:bg-ar-gray-700 text-ar-gray-300 transition-all duration-300" 
                        title="Edit"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit3 size={14} />
                      </motion.button>
                      <motion.button 
                        onClick={() => removeTask(t.id)} 
                        className="p-1 md:p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-all duration-300" 
                        title="Delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <EditTaskModal isOpen={!!editTask} onClose={() => setEditTask(null)} task={editTask} />
    </div>
  )
}


