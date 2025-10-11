import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useState } from "react"

const MotionDiv = motion.div
const MotionButton = motion.button

export default function FloatingActionButton({ actions = [], className = "" }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            className="absolute bottom-16 right-0 space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <MotionButton
                key={index}
                className="flex items-center gap-3 bg-ar-gray-800 hover:bg-ar-gray-700 text-ar-white px-4 py-3 rounded-full shadow-lg border border-ar-gray-700 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
              >
                <div className={`p-2 rounded-lg ${action.bgColor || 'bg-ar-blue'}`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </MotionButton>
            ))}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <MotionButton
        className="w-14 h-14 bg-ar-blue hover:bg-ar-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
      >
        <MotionDiv
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </MotionDiv>
      </MotionButton>
    </div>
  )
}