import { motion } from "framer-motion"
import { Flame, Sparkles } from "lucide-react"

export default function FocusGoalCard({
  quote = "Win the next block of time.",
  plannedMinutes = 120,
  completedMinutes = 0,
  xp = 0,
  nextLevelXp = 100,
  streakDays = 0,
}) {
  const progress = plannedMinutes > 0 ? Math.min((completedMinutes / plannedMinutes) * 100, 100) : 0
  const xpProgress = Math.min((xp / nextLevelXp) * 100, 100)

  return (
    <div className="glass-card p-4 md:p-6 rounded-2xl border border-ar-gray-700/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-hagrid font-light text-ar-white">Today's Goal</h2>
          <p className="text-ar-gray-400 text-sm md:text-base mt-1">{quote}</p>
        </div>
        {streakDays > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-orange-400">
            <Flame size={18} className="animate-pulse" />
            <span className="text-sm">Day {streakDays}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4">
        <Stat label="Daily Goal" value={`${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m`} />
        <Stat label="Completed" value={`${Math.floor(completedMinutes / 60)}h ${completedMinutes % 60}m`} />
        <Stat label="XP" value={`${xp}/${nextLevelXp}`} />
        <Stat label="Progress" value={`${Math.round(progress)}%`} />
      </div>

      <div className="mt-4 space-y-3">
        <Bar label="XP Progress" value={xpProgress} from="from-purple-500" to="to-purple-400" icon={<Sparkles size={14} className="text-purple-300" />} />
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-ar-gray-800/40 border border-ar-gray-700 rounded-xl p-2 md:p-3">
      <div className="text-xs text-ar-gray-400">{label}</div>
      <div className="text-ar-white text-sm md:text-base font-medium mt-1">{value}</div>
    </div>
  )
}

function Bar({ label, value, from, to, icon }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-ar-gray-400 flex items-center gap-1">{icon}{label}</span>
        <span className="text-ar-gray-300 font-medium">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-ar-gray-800 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className={`bg-gradient-to-r ${from} ${to} h-3 rounded-full shadow-lg`}
        />
      </div>
    </div>
  )
}


