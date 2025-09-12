import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Droplets, 
  Utensils, 
  Dumbbell, 
  Brain, 
  X 
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../store/userStore"

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWaterModal, setShowWaterModal] = useState(false)
  const [waterAmount, setWaterAmount] = useState(250)
  
  const navigate = useNavigate()
  const { updateWaterProgress } = useUserStore()

  const quickActions = [
    {
      id: 'water',
      icon: Droplets,
      label: 'Log Water',
      color: 'bg-ar-blue hover:bg-ar-blue-light',
      action: () => {
        setIsOpen(false)
        setShowWaterModal(true)
      }
    },
    {
      id: 'meal',
      icon: Utensils,
      label: 'Log Meal',
      color: 'bg-ar-green hover:bg-ar-green-light',
      action: () => {
        setIsOpen(false)
        navigate('/diet')
      }
    },
    {
      id: 'workout',
      icon: Dumbbell,
      label: 'Start Workout',
      color: 'bg-red-500 hover:bg-red-400',
      action: () => {
        setIsOpen(false)
        navigate('/workout')
      }
    },
    {
      id: 'meditation',
      icon: Brain,
      label: 'Start Meditation',
      color: 'bg-purple-500 hover:bg-purple-400',
      action: () => {
        setIsOpen(false)
        navigate('/mental-health')
      }
    },
  ]

  const handleLogWater = () => {
    updateWaterProgress(waterAmount)
    setShowWaterModal(false)
  }

  return (
    <>
      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 space-y-3"
            >
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.8, 
                      y: 20,
                      transition: { delay: (quickActions.length - index - 1) * 0.05 }
                    }}
                    onClick={action.action}
                    className={`${action.color} text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                    
                    {/* Tooltip */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="bg-ar-darker text-ar-white text-sm px-3 py-2 rounded-lg whitespace-nowrap font-hagrid font-light">
                        {action.label}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-400' 
              : 'bg-gradient-to-r from-ar-blue to-purple-600 hover:from-ar-blue-light hover:to-purple-500'
          } text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.1 : 1 
          }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <X size={24} />
          ) : (
            <Plus size={24} />
          )}
        </motion.button>

        {/* Ripple Effect */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-ar-blue/30 to-purple-600/30 rounded-full"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Water Logging Modal */}
      <AnimatePresence>
        {showWaterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWaterModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-6 rounded-2xl w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-hagrid font-light text-ar-white">Quick Log Water</h3>
                <button
                  onClick={() => setShowWaterModal(false)}
                  className="text-ar-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[250, 500, 750, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWaterAmount(amount)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      waterAmount === amount
                        ? 'bg-ar-blue text-white scale-105'
                        : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                    }`}
                  >
                    <div className="text-lg font-medium">{amount}ml</div>
                    <div className="text-xs opacity-70">
                      {amount === 250 ? 'Glass' : amount === 500 ? 'Bottle' : amount === 750 ? 'Large' : 'XL'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Log Button */}
              <button
                onClick={handleLogWater}
                className="w-full bg-ar-blue hover:bg-ar-blue-light text-white py-3 rounded-xl transition-colors shadow-button hover:shadow-button-hover"
              >
                Log {waterAmount}ml Water
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop when FAB is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
