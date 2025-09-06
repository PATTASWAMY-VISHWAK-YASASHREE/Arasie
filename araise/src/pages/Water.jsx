import { useState } from "react"
import { motion } from "framer-motion"
import { Droplet, Plus, Minus, Clock, Target, Zap } from "lucide-react"
import { useUserStore } from "../store/userStore"

export default function Water() {
  const [customAmount, setCustomAmount] = useState("")
  
  const {
    waterProgress,
    waterGoal,
    waterLogs,
    logWater,
    waterGoalMet
  } = useUserStore()

  const progressPercentage = Math.min((waterProgress / waterGoal) * 100, 100)
  const remainingWater = Math.max(waterGoal - waterProgress, 0)

  const quickAddAmounts = [250, 500, 750, 1000]

  const handleQuickAdd = async (amount) => {
    await logWater(amount)
    // Show celebration animation if goal is reached
    if (waterProgress + amount >= waterGoal) {
      // Could add confetti animation here
    }
  }

  const handleCustomAdd = async () => {
    const amount = parseInt(customAmount)
    if (amount > 0 && amount <= 2000) {
      await logWater(amount)
      setCustomAmount("")
    }
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Water Intake</h1>
        <p className="text-ar-gray-400 text-lg">
          Stay hydrated for optimal performance
        </p>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        className="glass-card p-8 rounded-2xl text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#2A2A2A"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#22D2FF"
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - progressPercentage / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="drop-shadow-2xl"
              filter="url(#glow)"
            />
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <Droplet 
                size={32} 
                className={`${waterGoalMet ? 'text-ar-blue' : 'text-ar-gray-400'} mb-2`}
              />
              {waterGoalMet && (
                <motion.div
                  className="absolute inset-0 text-ar-blue blur-sm"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <Droplet size={32} />
                </motion.div>
              )}
            </div>
            <div className="text-3xl font-bold text-ar-white">
              {waterProgress}ml
            </div>
            <div className="text-ar-gray-400">
              of {waterGoal}ml
            </div>
            <div className="text-ar-blue font-bold text-lg mt-1">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={20} className="text-ar-blue" />
              <span className="font-bold">Remaining</span>
            </div>
            <div className="text-2xl font-bold text-ar-blue">
              {remainingWater}ml
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={20} className="text-ar-blue" />
              <span className="font-bold">Today's Logs</span>
            </div>
            <div className="text-2xl font-bold text-ar-blue">
              {waterLogs.length}
            </div>
          </div>
        </div>

        {/* Goal Status */}
        {waterGoalMet && (
          <motion.div
            className="bg-ar-blue/20 border border-ar-blue/50 rounded-xl p-4 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="text-ar-blue font-bold text-lg">
              🎉 Daily hydration goal reached!
            </div>
            <div className="text-ar-gray-400 text-sm">
              Great job staying hydrated today!
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Add Section */}
      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Quick Add</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {quickAddAmounts.map(amount => (
            <motion.button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              className="bg-ar-blue/20 hover:bg-ar-blue/30 border border-ar-blue/50 rounded-xl p-4 transition-all duration-300 hover:shadow-card-hover"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-ar-blue font-bold text-lg">
                +{amount}ml
              </div>
              <div className="text-ar-gray-400 text-sm">
                {amount === 250 ? 'Glass' : amount === 500 ? 'Bottle' : amount === 750 ? 'Large' : 'Sports'}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Custom amount (ml)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-ar-gray-800/60 border border-ar-blue/30 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-500 focus:outline-none focus:border-ar-blue focus:shadow-card-hover"
              min="1"
              max="2000"
            />
          </div>
          <button
            onClick={handleCustomAdd}
            disabled={!customAmount || parseInt(customAmount) <= 0}
            className="bg-ar-blue hover:bg-ar-blue/80 disabled:bg-ar-gray/30 disabled:text-ar-gray-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-card-hover disabled:cursor-not-allowed"
          >
            <Plus size={20} />
          </button>
        </div>
      </motion.div>

      {/* Water Log */}
      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6">Today's Water Log</h2>
        
        {waterLogs.length === 0 ? (
          <div className="text-center py-8 text-ar-gray-400">
            <Droplet size={48} className="mx-auto mb-4 opacity-50" />
            <p>No water logged today</p>
            <p className="text-sm">Start tracking your hydration above!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {waterLogs.slice().reverse().map((log, index) => (
              <motion.div
                key={log.id}
                className="flex items-center justify-between p-4 bg-ar-gray-800/30 rounded-xl border border-ar-blue/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-ar-blue/20 rounded-lg">
                    <Droplet size={16} className="text-ar-blue" />
                  </div>
                  <div>
                    <div className="font-bold text-ar-white">
                      {log.amount}ml
                    </div>
                    <div className="text-sm text-ar-gray-400">
                      {formatDate(log.time)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-ar-gray-400">
                  <Clock size={16} />
                  <span className="text-sm">
                    {formatTime(log.time)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
