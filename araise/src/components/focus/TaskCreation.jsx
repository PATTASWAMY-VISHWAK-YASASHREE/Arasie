import { useState } from "react"
import { motion } from "framer-motion"
import { X, Plus, Minus } from "lucide-react"

export default function TaskCreation({ onSave, onClose, initialTask = null }) {
    const [taskName, setTaskName] = useState(initialTask?.name || '')
    const [duration, setDuration] = useState(initialTask?.duration || 60) // in minutes
    const [breakType, setBreakType] = useState('pomodoro') // 'off', 'pomodoro', 'custom'
    const [customCycles, setCustomCycles] = useState([
        { focus: 90, break: 10 }
    ])
    const [repeat, setRepeat] = useState('none') // 'none', 'daily', 'weekly'

    const handleDurationChange = (value) => {
        setDuration(Math.max(15, Math.min(360, value)))
    }

    const addCustomCycle = () => {
        setCustomCycles([...customCycles, { focus: 60, break: 10 }])
    }

    const updateCustomCycle = (index, field, value) => {
        const updated = customCycles.map((cycle, i) =>
            i === index ? { ...cycle, [field]: Math.max(5, Math.min(field === 'focus' ? 360 : 60, value)) } : cycle
        )
        setCustomCycles(updated)
    }

    const removeCustomCycle = (index) => {
        if (customCycles.length > 1) {
            setCustomCycles(customCycles.filter((_, i) => i !== index))
        }
    }

    const handleSave = () => {
        // Calculate the correct duration based on break type
        let sessionDuration = duration

        if (breakType === 'custom' && customCycles.length > 0) {
            // For custom cycles, use the total focus time from all cycles
            sessionDuration = customCycles.reduce((total, cycle) => total + cycle.focus, 0)
        }

        const taskData = {
            name: taskName,
            duration: sessionDuration,
            breakType,
            customCycles: breakType === 'custom' ? customCycles : null,
            repeat,
            created: new Date().toISOString()
        }
        onSave(taskData)
    }

    const getTotalDuration = () => {
        if (breakType === 'custom') {
            return customCycles.reduce((total, cycle) => total + cycle.focus + cycle.break, 0)
        }
        return duration + (breakType === 'pomodoro' ? 5 : 0)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-hagrid font-light text-ar-white">
                        {initialTask ? 'Edit Task' : 'Create Focus Session'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-ar-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Task Name */}
                    <div>
                        <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-2">
                            Task Name
                        </label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            placeholder="What will you focus on?"
                            className="w-full bg-ar-gray-800 border border-ar-gray-700 rounded-xl px-4 py-3 text-ar-white placeholder-ar-gray-400 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-2">
                            Duration: {duration} minutes
                        </label>

                        {/* Slider */}
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-ar-gray-400 text-sm">15m</span>
                            <input
                                type="range"
                                min="15"
                                max="360"
                                step="5"
                                value={duration}
                                onChange={(e) => handleDurationChange(Number(e.target.value))}
                                className="flex-1 h-2 bg-ar-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-ar-gray-400 text-sm">6h</span>
                        </div>

                        {/* Manual Input */}
                        <div className="flex items-center gap-2">
                            <span className="text-ar-gray-400 text-sm">Or type:</span>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => handleDurationChange(Number(e.target.value))}
                                min="15"
                                max="360"
                                className="w-20 bg-ar-gray-800 border border-ar-gray-700 rounded-lg px-3 py-2 text-ar-white text-center focus:border-purple-500 focus:outline-none"
                            />
                            <span className="text-ar-gray-400 text-sm">minutes</span>
                        </div>
                    </div>

                    {/* Break Settings */}
                    <div>
                        <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-3">
                            Breaks
                        </label>
                        <div className="space-y-3">
                            <button
                                onClick={() => setBreakType('off')}
                                className={`w-full p-3 rounded-xl text-left transition-all ${breakType === 'off'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                                    }`}
                            >
                                <div className="font-hagrid font-light">Off</div>
                                <div className="text-sm opacity-80">No breaks, pure focus</div>
                            </button>

                            <button
                                onClick={() => setBreakType('pomodoro')}
                                className={`w-full p-3 rounded-xl text-left transition-all ${breakType === 'pomodoro'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                                    }`}
                            >
                                <div className="font-hagrid font-light">Pomodoro (25+5)</div>
                                <div className="text-sm opacity-80">25 min focus + 5 min break</div>
                            </button>

                            <button
                                onClick={() => setBreakType('custom')}
                                className={`w-full p-3 rounded-xl text-left transition-all ${breakType === 'custom'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                                    }`}
                            >
                                <div className="font-hagrid font-light">Custom</div>
                                <div className="text-sm opacity-80">Create your own cycles</div>
                            </button>
                        </div>

                        {/* Custom Cycles */}
                        {breakType === 'custom' && (
                            <div className="mt-4 space-y-3">
                                {customCycles.map((cycle, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-ar-gray-800/50 rounded-xl">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-ar-gray-400">Focus:</span>
                                                <input
                                                    type="number"
                                                    value={cycle.focus}
                                                    onChange={(e) => updateCustomCycle(index, 'focus', Number(e.target.value))}
                                                    min="5"
                                                    max="360"
                                                    className="w-16 bg-ar-gray-700 border border-ar-gray-600 rounded px-2 py-1 text-ar-white text-sm"
                                                />
                                                <span className="text-sm text-ar-gray-400">min</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-ar-gray-400">Break:</span>
                                                <input
                                                    type="number"
                                                    value={cycle.break}
                                                    onChange={(e) => updateCustomCycle(index, 'break', Number(e.target.value))}
                                                    min="5"
                                                    max="60"
                                                    className="w-16 bg-ar-gray-700 border border-ar-gray-600 rounded px-2 py-1 text-ar-white text-sm"
                                                />
                                                <span className="text-sm text-ar-gray-400">min</span>
                                            </div>
                                        </div>
                                        {customCycles.length > 1 && (
                                            <button
                                                onClick={() => removeCustomCycle(index)}
                                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={addCustomCycle}
                                    className="w-full p-2 border-2 border-dashed border-ar-gray-600 rounded-xl text-ar-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Cycle
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Repeat Settings */}
                    <div>
                        <label className="block text-sm font-hagrid font-light text-ar-gray-400 mb-3">
                            Repeat
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['none', 'daily', 'weekly'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setRepeat(option)}
                                    className={`p-3 rounded-xl transition-all capitalize ${repeat === option
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-ar-gray-800 text-ar-gray-300 hover:bg-ar-gray-700'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-ar-gray-800/50 rounded-xl">
                        <div className="text-sm text-ar-gray-400 mb-2">Session Summary:</div>
                        <div className="text-ar-white">
                            <div>Total time: {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m</div>
                            {breakType === 'custom' && (
                                <div className="text-sm text-ar-gray-400 mt-1">
                                    {customCycles.length} cycle{customCycles.length > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!taskName.trim()}
                            className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-ar-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                        >
                            ✅ Save
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}