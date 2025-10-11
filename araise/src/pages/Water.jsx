import { useState } from "react"
import { motion } from "framer-motion"
import { Droplet, Plus, Clock, Target, Zap } from "lucide-react"
import { useUserStore } from "../store/userStore"
import WaterBottle from "../components/WaterBottle"

export default function Water() {
  const [customAmount, setCustomAmount] = useState("")
  
  const {
    waterProgress,
    waterGoal,
    waterLogs,
    logWater
  } = useUserStore()
  const remainingWater = Math.max(waterGoal - waterProgress, 0)

  const quickAddAmounts = [250, 500, 750, 1000]

  const handleQuickAdd = async (amount) => {
    await logWater(amount)
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
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">Water Intake</h1>
        <p className="text-ar-gray-400 text-base md:text-lg">
          Stay hydrated for optimal performance
        </p>
      </motion.div>

      {/* Progress Section - Enhanced Water Bottle */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          <WaterBottle />
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="glass-card p-4 md:p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Target size={16} className="text-ar-blue md:w-5 md:h-5" />
              <span className="font-bold text-sm md:text-base">Remaining</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-ar-blue">
              {remainingWater}ml
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Zap size={16} className="text-ar-blue md:w-5 md:h-5" />
              <span className="font-bold text-sm md:text-base">Today's Logs</span>
            </div>
            <div className="text-lg md:text-2xl font-bold text-ar-blue">
              {waterLogs.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Section */}
      <motion.div
        className="glass-card p-4 md:p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Quick Add</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {quickAddAmounts.map(amount => (
            <motion.button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              className="bg-ar-blue/20 hover:bg-ar-blue/30 border border-ar-blue/50 rounded-xl p-3 md:p-4 transition-all duration-300 hover:shadow-card-hover"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-ar-blue font-bold text-base md:text-lg">
                +{amount}ml
              </div>
              <div className="text-ar-gray-400 text-xs md:text-sm">
                {amount === 250 ? 'Glass' : amount === 500 ? 'Bottle' : amount === 750 ? 'Large' : 'Sports'}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex gap-3 md:gap-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Custom amount (ml)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-ar-gray-800/60 border border-ar-blue/30 rounded-xl px-3 md:px-4 py-2 md:py-3 text-ar-white placeholder-ar-gray-500 focus:outline-none focus:border-ar-blue focus:shadow-card-hover text-sm md:text-base"
              min="1"
              max="2000"
            />
          </div>
          <button
            onClick={handleCustomAdd}
            disabled={!customAmount || parseInt(customAmount) <= 0}
            className="bg-ar-blue hover:bg-ar-blue/80 disabled:bg-ar-gray/30 disabled:text-ar-gray-400 text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all duration-300 hover:shadow-card-hover disabled:cursor-not-allowed"
          >
            <Plus size={16} className="md:w-5 md:h-5" />
          </button>
        </div>
      </motion.div>

      {/* Water Log */}
      <motion.div
        className="glass-card p-4 md:p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Today's Water Log</h2>
        
        {waterLogs.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-ar-gray-400">
            <Droplet size={32} className="mx-auto mb-3 md:mb-4 opacity-50 md:w-12 md:h-12" />
            <p className="text-sm md:text-base">No water logged today</p>
            <p className="text-xs md:text-sm">Start tracking your hydration above!</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
            {waterLogs.slice().reverse().map((log, index) => (
              <motion.div
                key={log.id}
                className="flex items-center justify-between p-3 md:p-4 bg-ar-gray-800/30 rounded-xl border border-ar-blue/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-ar-blue/20 rounded-lg">
                    <Droplet size={12} className="text-ar-blue md:w-4 md:h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ar-white text-sm md:text-base">
                      {log.amount}ml
                    </div>
                    <div className="text-xs md:text-sm text-ar-gray-400">
                      {formatDate(log.time)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-ar-gray-400">
                  <Clock size={12} className="md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm">
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
