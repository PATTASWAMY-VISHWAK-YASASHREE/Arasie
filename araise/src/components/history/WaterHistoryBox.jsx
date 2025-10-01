import { motion } from "framer-motion"
import { Droplets, ChevronDown, ChevronUp } from "lucide-react"

export default function WaterHistoryBox({ activities, isExpanded, onToggle }) {
  const totalWater = activities.reduce((sum, log) => sum + log.amount, 0)
  const waterGoal = 3000 // Default goal in ml
  const progressPercentage = Math.min((totalWater / waterGoal) * 100, 100)

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatAmount = (amount) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}L`
    }
    return `${amount}ml`
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
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Droplets className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-ar-white font-medium">Water Intake</h3>
            <p className="text-ar-gray-400 text-sm">
              {formatAmount(totalWater)} of {formatAmount(waterGoal)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ar-gray-300 text-sm">
            {activities.length} {activities.length === 1 ? 'entry' : 'entries'}
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-ar-gray-800 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-ar-gray-400 mt-1">
          <span>0ml</span>
          <span className="text-blue-400">{progressPercentage.toFixed(0)}%</span>
          <span>{formatAmount(waterGoal)}</span>
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
          <h4 className="text-ar-white font-medium mb-3">Water Log Details</h4>
          {activities.length === 0 ? (
            <p className="text-ar-gray-400 text-sm">No water intake recorded</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activities
                .sort((a, b) => new Date(a.time) - new Date(b.time))
                .map((log, index) => (
                  <div
                    key={log.id || index}
                    className="flex items-center justify-between p-3 bg-ar-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Droplets className="text-blue-400" size={16} />
                      <span className="text-ar-white text-sm">
                        {formatAmount(log.amount)}
                      </span>
                    </div>
                    <span className="text-ar-gray-400 text-sm">
                      {formatTime(log.time)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}