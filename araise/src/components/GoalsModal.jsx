import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, Target, Droplets, Utensils } from "lucide-react"

const GOAL_CONFIGS = {
  focus: {
    title: "Daily Focus Goal",
    description: "Set your daily focus target",
    icon: Clock,
    unit: "minutes",
    unitShort: "min",
    min: 15,
    max: 480,
    presets: [
      { value: 30, label: "30 min", description: "Light focus" },
      { value: 60, label: "1 hour", description: "Balanced" },
      { value: 90, label: "1.5 hours", description: "Productive" },
      { value: 120, label: "2 hours", description: "Deep work" },
      { value: 180, label: "3 hours", description: "Intensive" }
    ],
    formatDisplay: (value) => `${Math.round(value / 60 * 10) / 10} hours per day`
  },
  water: {
    title: "Daily Water Goal",
    description: "Set your daily hydration target",
    icon: Droplets,
    unit: "milliliters",
    unitShort: "ml",
    min: 1000,
    max: 5000,
    presets: [
      { value: 2000, label: "2L", description: "Basic hydration" },
      { value: 2500, label: "2.5L", description: "Recommended" },
      { value: 3000, label: "3L", description: "Active lifestyle" },
      { value: 3500, label: "3.5L", description: "High activity" },
      { value: 4000, label: "4L", description: "Intense training" }
    ],
    formatDisplay: (value) => `${value / 1000}L per day`
  },
  calories: {
    title: "Daily Calorie Goal",
    description: "Set your daily calorie target",
    icon: Utensils,
    unit: "calories",
    unitShort: "cal",
    min: 1200,
    max: 4000,
    presets: [
      { value: 1500, label: "1,500", description: "Weight loss" },
      { value: 1800, label: "1,800", description: "Light activity" },
      { value: 2000, label: "2,000", description: "Moderate activity" },
      { value: 2200, label: "2,200", description: "Active lifestyle" },
      { value: 2500, label: "2,500", description: "High activity" }
    ],
    formatDisplay: (value) => `${value.toLocaleString()} calories per day`
  }
}

export default function GoalsModal({ isOpen, onClose, currentGoal, onSave, goalType = 'focus' }) {
  const config = GOAL_CONFIGS[goalType]
  const [selectedGoal, setSelectedGoal] = useState(currentGoal || config.presets[1].value)
  const [customGoal, setCustomGoal] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  const handleSave = () => {
    const goalToSave = isCustom ? parseInt(customGoal) : selectedGoal
    
    if (goalToSave >= config.min && goalToSave <= config.max) {
      onSave(goalToSave)
      onClose()
    }
  }

  const handleCustomToggle = () => {
    setIsCustom(!isCustom)
    if (!isCustom) {
      setCustomGoal(selectedGoal.toString())
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-ar-gray-900 rounded-2xl border border-ar-gray-700 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-ar-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ar-blue/20 rounded-lg">
                  <config.icon size={20} className="text-ar-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ar-white">{config.title}</h2>
                  <p className="text-sm text-ar-gray-400">{config.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-ar-gray-400 hover:text-ar-white transition-colors rounded-lg hover:bg-ar-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Preset Goals */}
              {!isCustom && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-ar-white">Choose a preset goal</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {config.presets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setSelectedGoal(preset.value)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedGoal === preset.value
                            ? 'border-ar-blue bg-ar-blue/10 text-ar-blue'
                            : 'border-ar-gray-700 bg-ar-gray-800/50 text-ar-white hover:border-ar-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{preset.label}</div>
                            <div className="text-xs text-ar-gray-400">{preset.description}</div>
                          </div>
                          <config.icon size={16} className="text-ar-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Goal */}
              {isCustom && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-ar-white">Custom goal ({config.min}-{config.max} {config.unit})</h3>
                  <div className="relative">
                    <input
                      type="number"
                      min={config.min}
                      max={config.max}
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      placeholder={`Enter ${config.unit}...`}
                      className="w-full px-4 py-3 bg-ar-gray-800 border border-ar-gray-700 rounded-lg text-ar-white placeholder-ar-gray-400 focus:border-ar-blue focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ar-gray-400 text-sm">
                      {config.unitShort}
                    </div>
                  </div>
                  {customGoal && (parseInt(customGoal) < config.min || parseInt(customGoal) > config.max) && (
                    <p className="text-xs text-ar-red">Goal must be between {config.min} and {config.max} {config.unit}</p>
                  )}
                </div>
              )}

              {/* Toggle Custom */}
              <button
                onClick={handleCustomToggle}
                className="text-sm text-ar-blue hover:text-ar-blue-light transition-colors"
              >
                {isCustom ? '← Back to presets' : 'Set custom goal →'}
              </button>

              {/* Current Selection */}
              <div className="p-4 bg-ar-gray-800/50 rounded-lg border border-ar-gray-700">
                <div className="flex items-center gap-2 text-ar-white">
                  <Target size={16} className="text-ar-blue" />
                  <span className="font-medium">
                    Selected goal: {isCustom ? customGoal || '0' : selectedGoal} {config.unitShort}
                  </span>
                </div>
                <p className="text-xs text-ar-gray-400 mt-1">
                  {config.formatDisplay(isCustom ? (parseInt(customGoal) || 0) : selectedGoal)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-ar-gray-700">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-ar-gray-300 hover:text-ar-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isCustom && (!customGoal || parseInt(customGoal) < config.min || parseInt(customGoal) > config.max)}
                className="flex-1 px-4 py-2 bg-ar-blue text-white rounded-lg hover:bg-ar-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}