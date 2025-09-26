import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Clock, Trash2, ArrowUp, ArrowDown, MoveHorizontal, MoveVertical } from "lucide-react"
import { useTaskStore } from "../../store/taskStore"

function formatDay(date) {
  return date.toISOString().slice(8,10)
}

function formatMonthDays(baseDate) {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate()
  return Array.from({ length: daysInMonth }).map((_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))
}

function formatRangeLabel(baseDate) {
  const start = new Date(baseDate)
  const day = start.getDay() || 7
  if (day !== 1) start.setDate(start.getDate() - (day - 1))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${start.toLocaleString(undefined,{ month:'long' })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
  }
  return `${start.toLocaleString(undefined,{ month:'short' })} ${start.getDate()} – ${end.toLocaleString(undefined,{ month:'short' })} ${end.getDate()}, ${end.getFullYear()}`
}

function fmt(ms) {
  const d = new Date(ms)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function InlineFocusCalendar() {
  const { tasks, getTasksForDate, deleteOccurrence, deleteSeries, shiftTask, resizeTask } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthDays = formatMonthDays(currentDate)
  const activeDay = currentDate.toISOString().slice(0,10)
  const rangeLabel = formatRangeLabel(currentDate)

  const dayTasks = useMemo(() => {
    return (getTasksForDate?.(activeDay) || [])
      .filter(t => t.startAt && t.endAt)
      .sort((a,b) => a.startAt - b.startAt)
  }, [tasks, activeDay, getTasksForDate])

  return (
    <div className="glass-card p-4 md:p-6 rounded-2xl">
      {/* Month header */}
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(d.getMonth()-1); return n })} className="p-2 text-ar-gray-300 hover:text-white"><ChevronLeft size={18} /></button>
        <div className="text-ar-white font-medium">
          {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setMonth(d.getMonth()+1); return n })} className="p-2 text-ar-gray-300 hover:text-white"><ChevronRight size={18} /></button>
      </div>
      <div className="text-xs text-ar-gray-400 mb-3">Week: {rangeLabel}</div>

      {/* Month strip (wraps into rows if space) */}
      <div className="flex flex-wrap gap-2 pb-2">
        {monthDays.map(d => {
          const iso = d.toISOString().slice(0,10)
          const isActive = iso === activeDay
          return (
            <button key={iso} onClick={() => setCurrentDate(d)} className={`flex flex-col items-center justify-center w-10 py-2 rounded-full ${isActive ? 'bg-ar-blue text-white' : 'bg-ar-gray-800/60 text-ar-gray-200'}`}>
              <div className="text-[10px] uppercase">{d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0,1)}</div>
              <div className="text-sm">{formatDay(d)}</div>
            </button>
          )
        })}
      </div>

      {/* Day timeline */}
      <div className="mt-4 space-y-2">
        {dayTasks.length === 0 && (
          <div className="text-ar-gray-400 text-sm">No time-blocked tasks for this day.</div>
        )}
        {dayTasks.map(t => (
          <motion.div key={t.id + ':' + activeDay} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(90deg, rgba(59,130,246,0.25), rgba(99,102,241,0.25))` }}>
            <div className="text-xs text-ar-gray-200 flex items-center gap-2"><Clock size={14} /> {fmt(t.startAt)} – {fmt(t.endAt)}</div>
            <div className="text-base font-medium mt-1">{t.title}</div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <button onClick={() => deleteOccurrence(t.id, activeDay)} className="px-2 py-1 rounded bg-ar-gray-800 text-ar-gray-200 text-xs flex items-center gap-1" title="Delete this occurrence">
                <Trash2 size={14} /> This
              </button>
              <button onClick={() => deleteSeries(t.id)} className="px-2 py-1 rounded bg-red-600/30 text-red-200 text-xs flex items-center gap-1" title="Delete entire series">
                <Trash2 size={14} /> Series
              </button>
              {/* Move controls (affect base task) */}
              <button onClick={() => shiftTask(t.id, -15)} className="px-2 py-1 rounded bg-ar-gray-800 text-ar-gray-200 text-xs flex items-center gap-1" title="Move earlier 15m">
                <ArrowUp size={14} /> -15m
              </button>
              <button onClick={() => shiftTask(t.id, 15)} className="px-2 py-1 rounded bg-ar-gray-800 text-ar-gray-200 text-xs flex items-center gap-1" title="Move later 15m">
                <ArrowDown size={14} /> +15m
              </button>
              {/* Resize controls */}
              <button onClick={() => resizeTask(t.id, -15)} className="px-2 py-1 rounded bg-ar-gray-800 text-ar-gray-200 text-xs flex items-center gap-1" title="Shorten 15m">
                <MoveHorizontal size={14} /> -15m
              </button>
              <button onClick={() => resizeTask(t.id, 15)} className="px-2 py-1 rounded bg-ar-gray-800 text-ar-gray-200 text-xs flex items-center gap-1" title="Extend 15m">
                <MoveVertical size={14} /> +15m
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


