import { motion } from "framer-motion"
import { Dumbbell, ChevronDown, ChevronUp, Clock, Target } from "lucide-react"

export default function WorkoutHistoryBox({ activities, isExpanded, onToggle }) {
  const totalWorkouts = activities.length
  
  // Calculate total exercises from the workout data (now properly structured)
  const totalExercises = activities.reduce((sum, workout) => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      return sum + workout.exercises.length
    }
    // Fallback for old data format
    if (typeof workout.exercises === 'number') {
      return sum + workout.exercises
    }
    return sum
  }, 0)

  const formatTime = (timeStr) => {
    return new Date(timeStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDuration = (minutes) => {
    const validMinutes = parseInt(minutes) || 0
    if (validMinutes === 0) return '0m'
    if (validMinutes < 60) {
      return `${validMinutes}m`
    }
    const hours = Math.floor(validMinutes / 60)
    const remainingMinutes = validMinutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <motion.div
      layout
      className="glass-card p-6 rounded-2xl cursor-pointer hover:bg-ar-gray-800/40 transition-colors"
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20">
            <Dumbbell className="text-red-400" size={24} />
          </div>
          <div>
            <h3 className="text-ar-white font-medium">Workout</h3>
            <p className="text-ar-gray-400 text-sm">
              {totalWorkouts} {totalWorkouts === 1 ? 'workout' : 'workouts'} • {totalExercises} exercises
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-ar-gray-300 text-sm">
            {totalExercises} exercises
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Summary Stats */}
      {totalWorkouts > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-ar-gray-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="text-red-400" size={16} />
              <span className="text-ar-white text-sm">Total Workouts</span>
            </div>
            <p className="text-red-400 font-medium">{totalWorkouts}</p>
          </div>
          <div className="bg-ar-gray-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="text-red-400" size={16} />
              <span className="text-ar-white text-sm">Total Exercises</span>
            </div>
            <p className="text-red-400 font-medium">{totalExercises}</p>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-ar-gray-700 pt-4"
        >
          <h4 className="text-ar-white font-medium mb-3">Workout Details</h4>
          {activities.length === 0 ? (
            <p className="text-ar-gray-400 text-sm">No workouts completed</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {activities.map((workout, index) => (
                <div
                  key={workout.id || `workout-${index}`}
                  className="p-4 bg-ar-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="text-red-400" size={16} />
                      <div>
                        <span className="text-ar-white font-medium">
                          {workout.planName || workout.name || workout.planId || 'Workout'}
                        </span>
                        <div className="text-ar-gray-400 text-xs">
                          {workout.type === 'cardio' ? 'Cardio Workout' : 
                           workout.type === 'custom' ? 'Custom Workout' :
                           workout.type === 'quick' ? 'Quick Workout' : 'Split Workout'}
                        </div>
                      </div>
                    </div>
                    <div className="text-ar-gray-400 text-sm">
                      {workout.duration ? formatDuration(workout.duration) : '30m'}
                    </div>
                  </div>

                  {/* Workout Summary */}
                  <div className="mb-3">
                    <div className="text-sm">
                      <span className="text-ar-gray-400">Split: </span>
                      <span className="text-red-400 font-medium">
                        {workout.planName || workout.name || workout.planId || 'Push Day'}
                      </span>
                      <span className="text-ar-gray-400 ml-4">
                        {workout.exercises ? workout.exercises.length : 0} exercises
                      </span>
                    </div>
                  </div>

                  {/* Exercise List */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="space-y-2">
                      <h6 className="text-ar-gray-300 text-sm font-medium">
                        Exercises ({workout.exercises.length}):
                      </h6>
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <div
                            key={`exercise-${exerciseIndex}`}
                            className="p-3 bg-ar-gray-900/30 rounded border border-ar-gray-700/50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-ar-white text-sm font-medium">
                                {exercise.exerciseName || exercise.name || `Exercise ${exerciseIndex + 1}`}
                              </span>
                              {exercise.duration && (
                                <span className="text-ar-gray-400 text-xs">
                                  {formatDuration(exercise.duration)}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 text-xs">
                              {/* Strength exercise info */}
                              {(exercise.sets && exercise.reps) && (
                                <div>
                                  <span className="text-ar-gray-400">Sets × Reps: </span>
                                  <span className="text-red-400 font-medium">
                                    {exercise.sets} × {exercise.reps}
                                  </span>
                                </div>
                              )}
                              {exercise.weight && exercise.weight > 0 && (
                                <div>
                                  <span className="text-ar-gray-400">Weight: </span>
                                  <span className="text-red-400 font-medium">{exercise.weight}kg</span>
                                </div>
                              )}
                              
                              {/* Cardio exercise info */}
                              {exercise.distance && (
                                <div>
                                  <span className="text-ar-gray-400">Distance: </span>
                                  <span className="text-red-400 font-medium">{exercise.distance}km</span>
                                </div>
                              )}
                              {exercise.speed && (
                                <div>
                                  <span className="text-ar-gray-400">Speed: </span>
                                  <span className="text-red-400 font-medium">{exercise.speed}km/h</span>
                                </div>
                              )}
                              {exercise.calories && (
                                <div>
                                  <span className="text-ar-gray-400">Calories: </span>
                                  <span className="text-red-400 font-medium">{exercise.calories}</span>
                                </div>
                              )}
                              
                              {/* Time-based exercise info */}
                              {exercise.restTime && (
                                <div>
                                  <span className="text-ar-gray-400">Rest: </span>
                                  <span className="text-red-400 font-medium">{exercise.restTime}s</span>
                                </div>
                              )}
                            </div>
                            
                            {exercise.notes && (
                              <div className="mt-2 text-ar-gray-300 text-xs">
                                <span className="text-ar-gray-400">Notes: </span>
                                {exercise.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion Time */}
                  {(workout.completedAt || workout.createdAt) && (
                    <div className="flex items-center gap-1 text-ar-gray-400 text-sm mt-3 pt-2 border-t border-ar-gray-700">
                      <Clock size={14} />
                      Completed at {formatTime(workout.completedAt || workout.createdAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}