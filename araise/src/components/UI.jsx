import { motion } from "framer-motion"

export function LoadingSpinner({ size = "md", color = "ar-blue" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  }
  
  const colorClasses = {
    "ar-blue": "border-ar-blue",
    "ar-violet": "border-ar-violet", 
    "ar-white": "border-ar-white"
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

export function Skeleton({ className = "", animate = true }) {
  return (
    <div className={`bg-ar-dark-gray rounded ${animate ? 'animate-pulse' : ''} ${className}`} />
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <motion.div
      className="glass-card p-6 rounded-2xl border border-red-400/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="text-center">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h3>
        <p className="text-ar-gray mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 text-red-400 font-bold py-2 px-4 rounded-xl transition-all duration-300"
          >
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function Toast({ message, type = "success", isVisible, onClose }) {
  if (!isVisible) return null

  const typeStyles = {
    success: "bg-ar-blue/20 border-ar-blue/50 text-ar-blue",
    error: "bg-red-400/20 border-red-400/50 text-red-400",
    warning: "bg-ar-violet/20 border-ar-violet/50 text-ar-violet"
  }

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border ${typeStyles[type]} max-w-sm`}
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-xl leading-none opacity-70 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}
