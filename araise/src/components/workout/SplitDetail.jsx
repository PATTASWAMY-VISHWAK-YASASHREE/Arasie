import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Clock,
  Target,
  Play,
  Heart,
  Dumbbell,
  Camera
} from "lucide-react"
import { workoutData } from "../../data/workoutData"

// Split Detail Component
export default function SplitDetail() {
  const { category, splitId } = useParams()
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState(null)

  const getSplitData = () => {
    switch (category) {
      case 'gym':
        return workoutData.gym[splitId]
      case 'calisthenics':
        return workoutData.calisthenics[splitId]
      case 'stretching':
        return workoutData.stretching[splitId]
      default:
        return null
    }
  }

  const split = getSplitData()

  if (!split) {
    return <div className="text-center text-ar-gray">Split not found</div>
  }

  // Handle stretching/yoga (sequence-based) vs gym/calisthenics (day-based)
  const isSequenceBased = split.sequence
  const days = isSequenceBased ? null : Object.entries(split.days || {})

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => navigate(`/workout/${category}`)}
          className="p-2 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300"
        >
          <ArrowLeft size={24} className="text-ar-blue" />
        </button>
        <div>
          <h1 className="text-4xl font-bold">{split.name}</h1>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-ar-blue">
              <Clock size={16} />
              <span>{split.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-ar-violet">
              <Target size={16} />
              <span>{split.type}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sequence-based (Stretching/Yoga) */}
      {isSequenceBased && (
        <motion.div
          className="glass-card p-6 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Sequence</h2>
          <div className="space-y-4 mb-8">
            {split.sequence.map((pose, index) => (
              <motion.div
                key={index}
                className="p-4 bg-ar-dark-gray/30 rounded-xl border border-ar-green/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ar-white mb-2">
                      {index + 1}. {pose.pose}
                    </h3>
                    <p className="text-ar-green font-medium mb-1">
                      {pose.duration}
                    </p>
                    <p className="text-ar-gray text-sm">
                      {pose.description}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-ar-green/20 rounded-lg flex items-center justify-center">
                    <Heart className="text-ar-green" size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => navigate(`/workout/${category}/${splitId}/session`)}
            className="w-full bg-ar-green hover:bg-ar-green/80 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-glow-green text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Play size={20} />
              Begin Session
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Day-based (Gym/Calisthenics) */}
      {!isSequenceBased && days && (
        <>
          {/* Day Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map(([dayKey, dayData], index) => (
              <motion.div
                key={dayKey}
                className={`glass-card p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedDay === dayKey
                  ? 'border-ar-blue bg-ar-blue/10'
                  : 'hover:border-ar-blue/50'
                  }`}
                onClick={() => setSelectedDay(selectedDay === dayKey ? null : dayKey)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-lg font-bold mb-2">{dayData.name}</h3>
                <p className="text-ar-gray text-sm mb-3">
                  {dayData.exercises.length} exercises
                </p>
                <div className="text-ar-blue text-sm">
                  {selectedDay === dayKey ? 'Click to collapse' : 'Click to expand'}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected Day Details */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div
                className="glass-card p-6 rounded-2xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">
                  {days.find(([key]) => key === selectedDay)[1].name} - Exercises
                </h2>
                <div className="space-y-4 mb-8">
                  {days.find(([key]) => key === selectedDay)[1].exercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      className="p-4 bg-ar-dark-gray/30 rounded-xl border border-ar-blue/20"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-ar-white mb-2">
                            {index + 1}. {exercise.exerciseName}
                          </h3>
                          <p className="text-ar-blue font-medium mb-1">
                            {exercise.sets} sets × {exercise.reps} reps
                          </p>
                          <p className="text-ar-gray text-sm mb-2">
                            {exercise.description}
                          </p>
                          {exercise.pose_analyzer && (
                            <div className="flex items-center gap-2 text-ar-violet text-sm">
                              <Camera size={14} />
                              <span>AI Form Analysis Available</span>
                            </div>
                          )}
                        </div>
                        <div className="w-16 h-16 bg-ar-blue/20 rounded-lg flex items-center justify-center">
                          <Dumbbell className="text-ar-blue" size={24} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={() => navigate(`/workout/${category}/${splitId}/${selectedDay}/session`)}
                  className="w-full bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-glow-blue text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Play size={20} />
                    Begin {days.find(([key]) => key === selectedDay)[1].name}
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}