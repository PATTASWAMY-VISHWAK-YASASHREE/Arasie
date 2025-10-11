import { motion } from "framer-motion"
import { Sparkles, Star } from "lucide-react"
import { useXpStore } from "../../store/xpStore"

export default function XpProgress({ className = "" }) {
  const { getDailyProgress } = useXpStore()
  const dailyProgress = getDailyProgress()
  
  const progress = dailyProgress.progress
  const xpNeeded = dailyProgress.threshold - dailyProgress.dailyXp

  return (
    <div className={`glass-card p-4 rounded-xl border border-ar-gray-700/60 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-ar-violet/20 rounded-lg">
            <Star size={16} className="text-ar-violet" />
          </div>
          <div>
            <div className="text-sm font-medium text-ar-white">Daily Progress</div>
            <div className="text-xs text-ar-gray-400">{dailyProgress.dailyXp} / {dailyProgress.threshold} XP</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-ar-violet">
          <Sparkles size={14} />
          <span className="text-sm font-medium">{xpNeeded} to goal</span>
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

      {/* Daily Status */}
      <div className="mt-3 text-center">
        {dailyProgress.isThresholdReached ? (
          <div className="text-ar-green text-xs font-medium">
            ✓ Daily goal achieved! Keep the streak going!
          </div>
        ) : (
          <div className="text-ar-gray-400 text-xs">
            Focus for {xpNeeded} more minutes to reach today's goal
          </div>
        )}
      </div>
    </div>
  )
}