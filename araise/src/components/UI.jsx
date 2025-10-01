import { motion } from "framer-motion"
import { Loader2, X } from "lucide-react"

// Loading Spinner Component
export function LoadingSpinner({ size = 20, className = "" }) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin text-ar-blue ${className}`} 
    />
  )
}

// Skeleton Loading Component
export function Skeleton({ className = "", children }) {
  return (
    <div className={`animate-pulse bg-ar-gray-700 rounded ${className}`}>
      {children}
    </div>
  )
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-xl border border-ar-gray-700/60">
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-ar-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-ar-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-ar-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-ar-gray-700 rounded"></div>
          <div className="h-3 bg-ar-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

// Button Component
export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  loading = false,
  className = "",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-ar-blue hover:bg-ar-blue-600 text-white focus:ring-ar-blue",
    secondary: "bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-gray-200 focus:ring-ar-gray-500",
    success: "bg-ar-green hover:bg-ar-green-600 text-white focus:ring-ar-green",
    danger: "bg-ar-red hover:bg-ar-red-600 text-white focus:ring-ar-red",
    ghost: "hover:bg-ar-gray-700 text-ar-gray-300 focus:ring-ar-gray-500"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size={16} className="mr-2" />}
      {children}
    </button>
  )
}

// Input Component
export function Input({ 
  label, 
  error, 
  className = "", 
  ...props 
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-ar-gray-300">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 bg-ar-gray-800 border rounded-lg text-ar-white placeholder-ar-gray-500
          focus:outline-none focus:ring-2 focus:ring-ar-blue focus:border-transparent
          ${error ? 'border-ar-red' : 'border-ar-gray-700'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-ar-red">{error}</p>
      )}
    </div>
  )
}

// Modal Component
export function Modal({ isOpen, onClose, title, children, className = "" }) {
  if (!isOpen) return null
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`glass-card p-6 rounded-2xl w-full max-w-md ${className}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-hagrid font-light text-ar-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-ar-gray-400" />
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  )
}