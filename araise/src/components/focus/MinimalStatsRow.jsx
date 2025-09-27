import { useMemo } from "react"
import { motion } from "framer-motion"
import { Clock, Crosshair, Flame } from "lucide-react"

export default function MinimalStatsRow({ focusLogs = [], streakDays = 0, tasks = [] }) {
  const today = new Date().toISOString().slice(0,10)
  const { minutes, sessions } = useMemo(() => {
    // Count focus log sessions (pomodoro sessions)
    const todaysFocusLogs = (focusLogs || []).filter(l => l.time && l.time.slice(0,10) === today && l.completed)
    const focusLogMinutes = todaysFocusLogs.reduce((t, s) => t + (s.duration || 0), 0)
    const focusLogSessions = todaysFocusLogs.length
    
    // Count completed focus tasks as sessions
    const completedFocusTasks = (tasks || []).filter(t => 
      t.date === today && t.done && t.focusMode
    )
    const taskMinutes = completedFocusTasks.reduce((total, task) => {
      if (task.startAt && task.endAt) {
        return total + Math.max(0, Math.round((task.endAt - task.startAt) / 60000))
      }
      return total + (task.focusDuration || 25) // fallback to focus duration
    }, 0)
    const taskSessions = completedFocusTasks.length
    
    return {
      minutes: focusLogMinutes + taskMinutes,
      sessions: focusLogSessions + taskSessions,
    }
  }, [focusLogs, tasks, today])

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <Stat icon={<Clock size={16} />} label="Minutes Today" value={`${minutes}m`} color="text-blue-400" />
      <Stat icon={<Crosshair size={16} />} label="Sessions Today" value={sessions} color="text-green-400" />
      <Stat icon={<Flame size={16} />} label="Day Streak" value={streakDays} color="text-orange-400" pulse={streakDays>0} />
    </div>
  )
}

function Stat({ icon, label, value, color, pulse }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 rounded-xl border border-ar-gray-700/50 text-center">
      <div className={`mx-auto w-7 h-7 rounded-lg ${color} flex items-center justify-center ${pulse ? 'animate-pulse' : ''}`}>{icon}</div>
      <div className="text-lg text-ar-white mt-1">{value}</div>
      <div className="text-xs text-ar-gray-400">{label}</div>
    </motion.div>
  )
}


