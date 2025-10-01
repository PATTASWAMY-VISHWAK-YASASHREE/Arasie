import { motion } from "framer-motion"
import { Sparkles, Star } from "lucide-react"
import { useXpStore } from "../../store/xpStore"

export default function XpProgress({ className = "" }) {
  const { level, xp, xpToNextLevel, totalXpForLevel } = useXpStore()
  
  const progress = totalXpForLevel > 0 ? (xp / totalXpForLevel) * 100 : 0
  const xpNeeded = xpToNextLevel

  return (
    <div className={`glass-card p-4 rounded-xl border border-ar-gray-700/60 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-ar-violet/20 rounded-lg">
            <Star size={16} className="text-ar-violet" />
          </div>
          <div>
            <div className="text-sm font-medium text-ar-white">Level {level}</div>
            <div className="text-xs text-ar-gray-400">{xp} / {totalXpForLevel} XP</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-ar-violet">
          <Sparkles size={14} />
          <span className="text-sm font-medium">{xpNeeded} to next</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-ar-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-ar-violet to-ar-blue rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* XP Breakdown */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-ar-gray-400">Focus</div>
          <div className="text-ar-blue font-medium">+25 XP</div>
        </div>
        <div className="text-center">
          <div className="text-ar-gray-400">Workout</div>
          <div className="text-ar-green font-medium">+50 XP</div>
        </div>
        <div className="text-center">
          <div className="text-ar-gray-400">Streak</div>
          <div className="text-ar-yellow font-medium">+10 XP</div>
        </div>
      </div>
    </div>
  )
}