import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Droplets, Plus, X } from "lucide-react"
import { useUserStore } from "../store/userStore"

export default function WaterBottle() {
  const [showModal, setShowModal] = useState(false)
  const [waterAmount, setWaterAmount] = useState(250)
  const [showAnimation, setShowAnimation] = useState(false)

  const { updateWaterProgress, getProgressStats } = useUserStore()
  const progressStats = getProgressStats()

  // Quick add amounts
  const quickAmounts = [250, 500, 750, 1000]

  const handleLogWater = async () => {
    await updateWaterProgress(waterAmount)
    setShowAnimation(true)
    setShowModal(false)

    // Reset animation after 2.5 seconds
    setTimeout(() => setShowAnimation(false), 2500)
  }

  const fillPercentage = Math.min(progressStats.water, 100)
  const waterAmountMl = Math.round((fillPercentage / 100) * 3000)

  return (
    <>
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-hagrid font-light text-ar-white mb-4 text-center">Daily Hydration</h3>

        <div className="relative flex justify-center items-center overflow-hidden px-4">
          {/* Water Level Scale - Aligned with bottle shape */}
          <div className="absolute left-2 top-0 h-48 flex flex-col justify-between text-xs text-ar-gray-600 z-10">
            {[100, 75, 50, 25, 0].map((level) => (
              <div key={level} className="flex items-center">
                <div className="w-2 h-px bg-ar-gray-600 mr-1"></div>
                <span className="text-[10px]">{level}%</span>
              </div>
            ))}
          </div>

          {/* Water Bottle Container - Enhanced Design */}
          <div
            className="relative w-32 h-48 cursor-pointer group mx-auto"
            onClick={() => setShowModal(true)}
          >
            {/* Bottle Outline - Simple bottle shape */}
            <div className="relative border-4 border-ar-blue/80 bg-transparent group-hover:border-ar-blue transition-all duration-300 h-full rounded-t-3xl rounded-b-2xl"
              style={{
                borderTopLeftRadius: '2rem',
                borderTopRightRadius: '2rem',
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem'
              }}>
              {/* Bottle Cap - contained within bounds */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-14 h-5 bg-gradient-to-b from-ar-gray-600 to-ar-gray-700 rounded-t-xl border-2 border-ar-blue/80 group-hover:border-ar-blue transition-colors">
                <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-ar-blue/60 rounded-sm"></div>
              </div>

              {/* Water Fill - Follows bottle shape */}
              <div className="absolute bottom-0 left-0 right-0 overflow-hidden h-full rounded-t-3xl rounded-b-2xl">
                <motion.div
                  className="relative rounded-t-3xl rounded-b-2xl"
                  style={{
                    background: `linear-gradient(to top, 
                      #0066CC 0%, 
                      #1E90FF 30%, 
                      #22D2FF 70%, 
                      #87CEEB 100%)`
                  }}
                  animate={{
                    height: `${fillPercentage}%`,
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {/* Animated water flow overlay */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(90deg, 
                        rgba(255, 255, 255, 0.1) 0%, 
                        rgba(255, 255, 255, 0.2) 50%, 
                        rgba(255, 255, 255, 0.1) 100%)`
                    }}
                    animate={{
                      x: [-20, 20, -20],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Water Surface Ripples */}
                  {fillPercentage > 5 && (
                    <>
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                        animate={{
                          scaleX: [0.8, 1.2, 0.8],
                          opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{
                          scaleX: [1, 0.6, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      />
                    </>
                  )}

                  {/* Enhanced Bubbles */}
                  {fillPercentage > 10 && [...Array(Math.min(Math.floor(fillPercentage / 20) + 3, 6))].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bg-white/70 rounded-full"
                      style={{
                        width: `${3 + i % 3}px`,
                        height: `${3 + i % 3}px`,
                        left: `${15 + i * 12}%`,
                        bottom: `${5 + (i * 15) % 60}%`
                      }}
                      animate={{
                        y: [0, -20 - i * 3, -40 - i * 5],
                        x: [0, Math.sin(i) * 3, Math.sin(i + 1) * 2],
                        opacity: [0.7, 1, 0],
                        scale: [0.8, 1.2, 0.6]
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.7,
                        ease: "easeOut"
                      }}
                    />
                  ))}

                  {/* Water splash animation when logging */}
                  <AnimatePresence>
                    {showAnimation && (
                      <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {/* Rising water effect */}
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/30 to-transparent rounded-b-2xl"
                          initial={{ height: "0%", opacity: 0 }}
                          animate={{
                            height: "100%",
                            opacity: [0, 1, 0]
                          }}
                          transition={{ duration: 2, ease: "easeOut" }}
                        />

                        {/* Enhanced splash bubbles */}
                        {[...Array(15)].map((_, i) => (
                          <motion.div
                            key={`splash-${i}`}
                            className="absolute bg-white/80 rounded-full"
                            style={{
                              width: `${2 + i % 4}px`,
                              height: `${2 + i % 4}px`,
                              left: `${10 + (i * 5) % 80}%`,
                              bottom: `${5 + (i * 6) % 70}%`
                            }}
                            initial={{ scale: 0, opacity: 0, y: 0 }}
                            animate={{
                              scale: [0, 2, 0],
                              opacity: [0, 1, 0],
                              y: [0, -25 - i * 2, -50 - i * 4]
                            }}
                            transition={{
                              duration: 2.5,
                              delay: i * 0.08,
                              ease: "easeOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-ar-blue/40 backdrop-blur-sm rounded-full p-3">
                  <Plus size={18} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Glass reflection effect - fills entire bottle */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-48 bg-gradient-to-br from-white/8 via-white/3 to-transparent pointer-events-none rounded-t-3xl rounded-b-2xl"
               style={{
                 borderTopLeftRadius: '2rem',
                 borderTopRightRadius: '2rem',
                 borderBottomLeftRadius: '1rem',
                 borderBottomRightRadius: '1rem'
               }}></div>
        </div>

        {/* Progress Text */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Droplets size={16} className="text-ar-blue" />
            <p className="text-ar-blue font-medium text-sm">
              {Math.round(fillPercentage)}% Complete
            </p>
          </div>

          {/* Water amount indicator */}
          <div className="text-xs text-ar-gray-400 mb-2">
            {waterAmountMl}ml / 3000ml
          </div>

          <p className="text-ar-gray-500 text-xs">
            {fillPercentage < 100 ? 'Tap bottle to add water' : '🎉 Daily goal reached!'}
          </p>
        </div>

        {/* Fun Motivational Message */}
        <AnimatePresence>
          {fillPercentage >= 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="mt-4 text-center"
            >
              <div className="bg-ar-green/20 text-ar-green px-4 py-2 rounded-xl text-xs font-medium border border-ar-green/30">
                🌊 Hydration Master! Keep it up!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Water Logging Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-6 rounded-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-hagrid font-light text-ar-white">Log Water Intake</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-ar-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Custom Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-2">
                  Amount (ml)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(Number(e.target.value))}
                    className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white focus:border-ar-blue focus:outline-none pr-12"
                    min="50"
                    max="2000"
                    step="50"
                  />
                  <Droplets className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ar-blue" size={20} />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm font-hagrid font-light text-ar-gray-400 mb-3">Quick Add</p>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setWaterAmount(amount)}
                      className={`p-3 rounded-xl text-sm transition-all ${waterAmount === amount
                        ? 'bg-ar-blue text-white scale-105'
                        : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                        }`}
                    >
                      <div className="font-medium">{amount}ml</div>
                      <div className="text-xs opacity-70 mt-1">
                        {amount === 250 ? 'Glass' : amount === 500 ? 'Bottle' : amount === 750 ? 'Large' : 'XL'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-gray-300 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogWater}
                  className="flex-1 bg-ar-blue hover:bg-ar-blue-light text-white py-3 rounded-xl transition-colors"
                >
                  Log Water
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
