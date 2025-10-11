import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Dumbbell,
  Target,
  CheckCircle,
  Camera,
  ArrowLeft,
  Clock,
  Trophy,
  Sparkles,
  Heart,
  Flame,
  Plus
} from "lucide-react"
import { useUserStore } from "../store/userStore"
import PoseAnalyzer from "../components/PoseAnalyzer"
import WorkoutHub from "../components/workout/WorkoutHub"
import CategorySelection from "../components/workout/CategorySelection"
import SplitDetail from "../components/workout/SplitDetail"
import WorkoutSession from "../components/workout/WorkoutSession"
import CameraSelectionModal from "../components/CameraSelectionModal"
import { exerciseLibrary, workoutData } from "../data/workoutData"
import { isMobile } from "../utils/helpers"

// Form Analyzer Component
function FormAnalyzer() {
  const { category, splitId, dayId, exerciseId, exerciseName } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { cameraFacingMode } = location.state || { cameraFacingMode: 'user' }

  const handleBack = () => {
    const sessionPath = dayId
      ? `/workout/${category}/${splitId}/${dayId}/session`
      : `/workout/${category}/${splitId}/session`
    navigate(sessionPath)
  }

  const handleComplete = () => {
    const sessionPath = dayId
      ? `/workout/${category}/${splitId}/${dayId}/session`
      : `/workout/${category}/${splitId}/session`
    navigate(sessionPath)
  }

  return (
    <div className="fixed inset-0 bg-ar-black flex flex-col md:pl-[280px] h-full">
      <div className="p-6 flex-1">
        <PoseAnalyzer
          exerciseName={exerciseName}
          category={category}
          splitId={splitId}
          dayId={dayId}
          cameraFacingMode={cameraFacingMode}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}

// Workout Complete Component with Enhanced Animations
function WorkoutComplete() {
  const { category, splitId, dayId } = useParams()
  const navigate = useNavigate()
  const { 
    startWorkoutSession, 
    completeWorkoutSession, 
    currentWorkoutSession,
    updateExerciseInSession 
  } = useUserStore()
  const [showConfetti, setShowConfetti] = useState(true)
  const [workoutSaved, setWorkoutSaved] = useState(false)

  const getCompletionData = () => {
    // Get workout data from workoutData structure
    const workoutPlan = workoutData[category]?.[splitId];
    
    if (!workoutPlan) {
      return {
        planName: dayId ? `${splitId} - ${dayId}` : splitId,
        type: category || "split",
        duration: 30,
        exercises: []
      };
    }

    // Handle sequence-based workouts (stretching & yoga)
    if (workoutPlan.sequence) {
      const exercises = workoutPlan.sequence.map(pose => ({
        exerciseName: pose.pose,
        sets: 1, // Poses are typically held once
        reps: pose.duration || "30 seconds",
        weight: 0, // No weight for poses
        primaryMuscle: "Full Body", // Default for stretching/yoga
        secondaryMuscles: [],
        description: pose.description || ""
      }));

      return {
        planName: workoutPlan.name,
        planId: splitId,
        dayId: null, // No dayId for sequence-based workouts
        type: category === "stretching" ? "stretching" : "yoga",
        duration: 30, // Default duration for yoga/stretching
        exercises: exercises
      };
    }

    // Handle day-based workouts (gym/calisthenics)
    const dayData = workoutPlan?.days?.[dayId];
    if (!dayData) {
      return {
        planName: dayId ? `${splitId} - ${dayId}` : splitId,
        type: category || "split", // Use actual category
        duration: 30,
        exercises: []
      };
    }

    // Convert workout exercises to new schema format
    const exercises = dayData.exercises.map(exercise => ({
      exerciseName: exercise.exerciseName,
      sets: exercise.sets,
      reps: parseInt(exercise.reps) || 12,
      weight: 0, // Default weight, user would set this during workout
      primaryMuscle: exercise.primaryMuscle,
      secondaryMuscles: exercise.secondaryMuscles
    }));

    return {
      planName: `${workoutPlan.name} - ${dayData.splitDay || dayData.name}`,
      planId: splitId,
      dayId: dayId,
      type: category || "split", // Use actual category (gym, calisthenics, etc.)
      duration: 45, // Default duration
      exercises: exercises
    };
  }

  const completionData = getCompletionData()

  useEffect(() => {
    // Save workout data only once when component loads
    const saveWorkoutData = async () => {
      if (workoutSaved) {
        return;
      }

      if (completionData && completionData.exercises && completionData.exercises.length > 0) {
        setWorkoutSaved(true); // Set flag immediately to prevent multiple saves
        
        try {
          // Use the saveWorkoutSession method directly with proper data structure
          const state = useUserStore.getState();
          const { saveWorkoutSession, firebaseService } = state;
          
          const workoutSessionData = {
            id: Date.now(),
            type: completionData.type || "split",
            planName: completionData.planName,
            planId: completionData.planId || splitId,
            dayId: completionData.dayId || dayId,
            date: new Date().toISOString().slice(0, 10),
            duration: completionData.duration || 45,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            exercises: completionData.exercises.map(exercise => ({
              exerciseName: exercise.exerciseName,
              sets: exercise.sets || 1,
              reps: exercise.reps || (typeof exercise.reps === 'string' ? exercise.reps : 12),
              weight: exercise.weight || 0,
              completed: true,
              primaryMuscle: exercise.primaryMuscle || "Full Body",
              secondaryMuscles: exercise.secondaryMuscles || []
            })),
            completed: true,
            totalExercises: completionData.exercises.length,
            completedExercises: completionData.exercises.length
          };

          if (!firebaseService) {
            setWorkoutSaved(false); // Reset flag on error
            return;
          }
          
          if (!saveWorkoutSession) {
            setWorkoutSaved(false); // Reset flag on error
            return;
          }
          
          await saveWorkoutSession(workoutSessionData);
        } catch (error) {
          setWorkoutSaved(false); // Reset flag on error to allow retry
        }
      }
    };

    saveWorkoutData();
  }, [category, splitId, dayId, workoutSaved]) // Remove completionData from dependencies

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!completionData) {
    return <div className="text-center text-ar-gray">Session not found</div>
  }

  const getAnimationByCategory = () => {
    switch (category) {
      case 'gym':
      case 'calisthenics':
        return {
          emoji: '🎉',
          title: 'Workout Complete!',
          color: 'blue',
          animation: 'confetti'
        }
      case 'stretching':
        return {
          emoji: '🧘‍♀️',
          title: 'Session Complete!',
          color: 'green',
          animation: 'breathing'
        }
      default:
        return {
          emoji: '✨',
          title: 'Complete!',
          color: 'violet',
          animation: 'sparkle'
        }
    }
  }

  const animationData = getAnimationByCategory()

  const getCompletionColorClasses = () => {
    switch (animationData.color) {
      case 'green':
        return {
          text: 'text-ar-green',
          bg: 'bg-ar-green',
          bgLight: 'bg-ar-green/20',
          border: 'border-ar-green/50',
          hover: 'hover:bg-ar-green/80',
          shadow: 'hover:shadow-glow-green'
        }
      case 'violet':
        return {
          text: 'text-ar-violet',
          bg: 'bg-ar-violet',
          bgLight: 'bg-ar-violet/20',
          border: 'border-ar-violet/50',
          hover: 'hover:bg-ar-violet/80',
          shadow: 'hover:shadow-glow-violet'
        }
      default:
        return {
          text: 'text-ar-blue',
          bg: 'bg-ar-blue',
          bgLight: 'bg-ar-blue/20',
          border: 'border-ar-blue/50',
          hover: 'hover:bg-ar-blue/80',
          shadow: 'hover:shadow-glow-blue'
        }
    }
  }

  const colors = getCompletionColorClasses()

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Confetti Effect */}
      {showConfetti && animationData.animation === 'confetti' && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-ar-blue rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="glass-card p-8 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
      >
        {/* Plant Growth Animation for Streaks */}
        <motion.div
          className="absolute top-4 right-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, duration: 0.8, type: "spring" }}
        >
          <div className="text-2xl">🌱</div>
        </motion.div>

        {/* Main Success Animation */}
        <motion.div
          className="text-8xl mb-6"
          animate={
            animationData.animation === 'breathing'
              ? { scale: [1, 1.1, 1] }
              : animationData.animation === 'sparkle'
                ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                : { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
          }
          transition={{
            duration: animationData.animation === 'breathing' ? 4 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {animationData.emoji}
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">{animationData.title}</h1>
        <p className="text-ar-gray text-lg mb-8">
          Excellent work completing {completionData.name}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={20} className={colors.text} />
              <span className="font-bold">Duration</span>
            </div>
            <div className={`text-2xl font-bold ${colors.text}`}>
              {completionData.duration}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={20} className="text-ar-violet" />
              <span className="font-bold">Type</span>
            </div>
            <div className="text-2xl font-bold text-ar-violet">
              {completionData.type}
            </div>
          </div>
          <div className="text-center md:col-span-1 col-span-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={20} className="text-green-400" />
              <span className="font-bold">XP Gained</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              +{category === 'gym' || category === 'calisthenics' ? '50' : '25'}
            </div>
          </div>
        </div>

        {/* Achievement Notifications */}
        <div className="space-y-4 mb-8">
          <motion.div
            className={`${colors.bgLight} ${colors.border} border rounded-xl p-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame size={24} className={colors.text} />
              <span className={`font-bold ${colors.text}`}>Streak Updated!</span>
            </div>
            <p className="text-ar-gray text-sm">
              Keep going to maintain your fitness streak
            </p>
          </motion.div>

          {/* Wellness Score Update for Stretching & Yoga */}
          {category === 'stretching' && (
            <motion.div
              className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart size={24} className="text-green-400" />
                <span className="font-bold text-green-400">Wellness Score +10</span>
              </div>
              <p className="text-ar-gray text-sm">
                Your mindfulness and flexibility improved
              </p>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex-1 ${colors.bg} ${colors.hover} text-white font-bold py-4 rounded-xl transition-all duration-300 ${colors.shadow} text-lg`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy size={20} />
              Dashboard
            </div>
          </button>

          <button
            onClick={() => navigate('/workout')}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
          >
            <div className="flex items-center justify-center gap-2">
              <Dumbbell size={20} />
              More Workouts
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Custom Workout Builder Component
function CustomWorkoutBuilder() {
  const navigate = useNavigate()
  const { saveCustomWorkout } = useUserStore()
  const [workoutName, setWorkoutName] = useState('')
  const [workoutGoal, setWorkoutGoal] = useState('')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [currentCategory, setCurrentCategory] = useState('gym')
  const [isSaving, setIsSaving] = useState(false)

  const addExercise = (exercise) => {
    setSelectedExercises([...selectedExercises, { 
      ...exercise, 
      id: Date.now(),
      customSets: exercise.sets || 3,
      customReps: exercise.reps || '8-12'
    }])
  }

  const updateExercise = (id, field, value) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ))
  }

  const removeExercise = (id) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== id))
  }

  const saveWorkout = async () => {
    if (!workoutName || selectedExercises.length === 0) return

    setIsSaving(true)
    try {
      // Prepare exercises with custom sets/reps
      const exercisesToSave = selectedExercises.map(exercise => ({
        ...exercise,
        sets: exercise.customSets || exercise.sets,
        reps: exercise.customReps || exercise.reps,
        exerciseName: exercise.name || exercise.exerciseName // Ensure consistent naming
      }))

      await saveCustomWorkout({
        name: workoutName,
        goal: workoutGoal,
        exercises: exercisesToSave
      })

      navigate('/workout/custom/my-workouts')
    } catch (error) {
      console.error('Error saving workout:', error)
      // Could add toast notification here
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => navigate('/workout')}
          className="w-12 h-12 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-ar-blue" />
        </button>
        <div>
          <h1 className="text-4xl font-bold">Custom Workout Builder</h1>
          <p className="text-ar-gray">Create your personalized training routine</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workout Setup */}
        <motion.div
          className="glass-card p-6 rounded-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4">Workout Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Workout Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full p-3 bg-ar-dark-gray/50 border border-ar-blue/30 rounded-xl text-white placeholder-ar-gray focus:border-ar-blue focus:outline-none"
                placeholder="My Custom Workout"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goal</label>
              <select
                value={workoutGoal}
                onChange={(e) => setWorkoutGoal(e.target.value)}
                className="w-full p-3 bg-ar-dark-gray/50 border border-ar-blue/30 rounded-xl text-white focus:border-ar-blue focus:outline-none"
              >
                <option value="">Select Goal</option>
                <option value="strength">Strength</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="mixed">Mixed Training</option>
              </select>
            </div>
          </div>

          {/* Selected Exercises */}
          <div className="mt-6">
            <h4 className="font-bold mb-3">Selected Exercises ({selectedExercises.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedExercises.map((exercise, index) => (
                <div key={exercise.id} className="p-3 bg-ar-dark-gray/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{index + 1}. {exercise.name || exercise.exerciseName}</span>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      ×
                    </button>
                  </div>
                  
                  {exercise.sets ? (
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-ar-gray">Sets:</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={exercise.customSets}
                          onChange={(e) => updateExercise(exercise.id, 'customSets', parseInt(e.target.value))}
                          className="w-12 px-1 py-0.5 bg-ar-gray-800 border border-ar-gray-600 rounded text-ar-white text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-ar-gray">Reps:</span>
                        <input
                          type="text"
                          value={exercise.customReps}
                          onChange={(e) => updateExercise(exercise.id, 'customReps', e.target.value)}
                          className="w-16 px-1 py-0.5 bg-ar-gray-800 border border-ar-gray-600 rounded text-ar-white text-center"
                          placeholder="8-12"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-ar-gray">
                      Duration: {exercise.duration}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={saveWorkout}
            disabled={!workoutName || selectedExercises.length === 0 || isSaving}
            className="w-full mt-6 bg-ar-violet hover:bg-ar-violet/80 disabled:bg-ar-gray disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300"
          >
            {isSaving ? 'Saving...' : 'Save Workout'}
          </button>
        </motion.div>

        {/* Exercise Library */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {Object.keys(exerciseLibrary).map((category) => (
              <button
                key={category}
                onClick={() => setCurrentCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${currentCategory === category
                    ? 'bg-ar-blue text-white'
                    : 'bg-white/10 text-ar-gray hover:bg-white/20'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Exercise Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            key={currentCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {exerciseLibrary[currentCategory].map((exercise) => (
              <div key={exercise.id} className="glass-card p-4 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold">{exercise.name || exercise.exerciseName}</h4>
                    <p className="text-sm text-ar-gray">
                      {exercise.sets ? `${exercise.sets} sets × ${exercise.reps}` : exercise.duration}
                    </p>
                  </div>
                  <button
                    onClick={() => addExercise(exercise)}
                    className="bg-ar-blue/20 hover:bg-ar-blue/30 text-ar-blue p-2 rounded-lg transition-all duration-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {exercise.pose_analyzer && (
                  <div className="flex items-center gap-2 text-ar-violet text-xs">
                    <Camera size={12} />
                    <span>AI Form Analysis</span>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// My Custom Workouts Component
function MyCustomWorkouts() {
  const navigate = useNavigate()
  const { customWorkouts, loadCustomWorkouts, deleteCustomWorkout } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWorkouts = async () => {
      setIsLoading(true)
      try {
        await loadCustomWorkouts()
      } catch (error) {
        console.error('Error loading workouts:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkouts()
  }, [loadCustomWorkouts])

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteCustomWorkout(id)
    } catch (error) {
      console.error('Error deleting workout:', error)
      // Could add toast notification here
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => navigate('/workout')}
          className="w-12 h-12 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-ar-blue" />
        </button>
        <div>
          <h1 className="text-4xl font-bold">My Workouts</h1>
          <p className="text-ar-gray">Your custom created workouts</p>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="glass-card p-8 rounded-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-xl font-bold mb-4">Loading Workouts...</h3>
        </motion.div>
      ) : customWorkouts.length === 0 ? (
        <motion.div
          className="glass-card p-8 rounded-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-4xl mb-4">💪</div>
          <h3 className="text-xl font-bold mb-4">No Custom Workouts Yet</h3>
          <p className="text-ar-gray mb-6">Create your first custom workout to get started</p>
          <button
            onClick={() => navigate('/workout/custom/builder')}
            className="bg-ar-violet hover:bg-ar-violet/80 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Create Workout
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              className="glass-card p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold mb-2">{workout.name}</h3>
              <p className="text-ar-blue text-sm mb-4">{workout.goal}</p>
              <p className="text-ar-gray text-sm mb-4">
                {workout.exercises.length} exercises
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/workout/custom/${workout.id}/session`)}
                  className="flex-1 bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-2 rounded-lg transition-all duration-300"
                >
                  Start
                </button>
                <button
                  onClick={() => handleDeleteWorkout(workout.id)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all duration-300"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// Custom Workout Session Component
function CustomWorkoutSession() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { customWorkouts, loadCustomWorkouts } = useUserStore()
  const [currentExercise, setCurrentExercise] = useState(0)
  const [workout, setWorkout] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [pendingExercise, setPendingExercise] = useState(null)

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true)
      try {
        await loadCustomWorkouts()
        const foundWorkout = customWorkouts.find(w => w.id === parseInt(workoutId))
        setWorkout(foundWorkout)
      } catch (error) {
        console.error('Error loading workout:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkout()
  }, [workoutId, loadCustomWorkouts])

  // Also check when customWorkouts updates
  useEffect(() => {
    if (customWorkouts.length > 0) {
      const foundWorkout = customWorkouts.find(w => w.id === parseInt(workoutId))
      setWorkout(foundWorkout)
      setIsLoading(false)
    }
  }, [customWorkouts, workoutId])

  if (isLoading) {
    return <div className="text-center text-ar-gray">Loading workout...</div>
  }

  if (!workout) {
    return <div className="text-center text-ar-gray">Workout not found</div>
  }

  const exercise = workout.exercises[currentExercise]
  const isLastExercise = currentExercise === workout.exercises.length - 1

  const handleNext = () => {
    if (isLastExercise) {
      navigate(`/workout/custom/${workoutId}/complete`)
    } else {
      setCurrentExercise(currentExercise + 1)
    }
  }

  const handleAnalyzer = () => {
    if (isMobile()) {
      // On mobile, show camera selection modal first
      setPendingExercise(exercise)
      setShowCameraModal(true)
    } else {
      // On desktop, proceed directly with default camera
      navigate(`/workout/custom/${workoutId}/session/${exercise.id}/analyzer/${exercise.exerciseName}`, {
        state: { cameraFacingMode: 'user' }
      })
    }
  }

  const handleCameraSelection = (facingMode) => {
    if (pendingExercise) {
      navigate(`/workout/custom/${workoutId}/session/${pendingExercise.id}/analyzer/${pendingExercise.exerciseName}`, {
        state: { cameraFacingMode: facingMode }
      })
    }
    setShowCameraModal(false)
    setPendingExercise(null)
  }

  const handleCameraModalClose = () => {
    setShowCameraModal(false)
    setPendingExercise(null)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
      {/* Progress Bar */}
      <motion.div
        className="glass-card p-3 md:p-4 rounded-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-1 md:mb-2">
          <span className="text-ar-gray">Progress</span>
          <span className="text-ar-violet font-bold">
            {currentExercise + 1} / {workout.exercises.length}
          </span>
        </div>
        <div className="w-full bg-ar-dark-gray rounded-full h-3">
          <motion.div
            className="bg-ar-violet h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentExercise + 1) / workout.exercises.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Exercise Display */}
      <motion.div
        className="glass-card p-3 md:p-4 rounded-2xl text-center"
        key={currentExercise}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Exercise Animation */}
        <div className="w-64 h-96 md:w-72 md:h-[28rem] mx-auto mb-3 md:mb-4 bg-ar-violet/20 rounded-2xl overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="text-ar-violet" size={64} />
            </motion.div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{exercise.exerciseName}</h2>
        <p className="text-ar-violet text-lg md:text-xl font-bold mb-1">
          {exercise.sets ? `${exercise.sets} sets × ${exercise.reps} reps` : exercise.duration}
        </p>
        <p className="text-ar-gray mb-3 md:mb-4">Custom Exercise</p>

        <div className="flex flex-col gap-2 md:gap-3 justify-center px-4 md:px-0">
          {exercise.pose_analyzer && (
            <button
              onClick={handleAnalyzer}
              className="w-full bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 hover:shadow-glow-blue"
            >
              <div className="flex items-center justify-center gap-2">
                <Camera size={18} className="md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Form Analyzer</span>
              </div>
            </button>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-ar-violet hover:bg-ar-violet/80 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 hover:shadow-glow-violet"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={18} className="md:w-5 md:h-5" />
              <span className="text-sm md:text-base">
                {isLastExercise ? 'Finish Workout' : 'Exercise Done'}
              </span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Camera Selection Modal */}
      <CameraSelectionModal
        isOpen={showCameraModal}
        onClose={handleCameraModalClose}
        onSelect={handleCameraSelection}
      />
    </div>
  )
}

// Custom Workout Complete Component
function CustomWorkoutComplete() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { 
    startWorkoutSession, 
    completeWorkoutSession, 
    currentWorkoutSession,
    customWorkouts, 
    loadCustomWorkouts 
  } = useUserStore()
  const [workout, setWorkout] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workoutSaved, setWorkoutSaved] = useState(false)

  useEffect(() => {
    const loadWorkout = async () => {
      setIsLoading(true)
      try {
        await loadCustomWorkouts()
        const foundWorkout = customWorkouts.find(w => w.id === parseInt(workoutId))
        setWorkout(foundWorkout)

        if (foundWorkout && !workoutSaved) {
          // Save custom workout session data only once
          setWorkoutSaved(true); // Set flag immediately to prevent multiple saves
          
          try {
            const state = useUserStore.getState();
            const { saveWorkoutSession, firebaseService } = state;
            
            const workoutSessionData = {
              id: Date.now(),
              type: "custom",
              planName: foundWorkout.name,
              planId: `custom-${foundWorkout.id}`,
              dayId: null,
              date: new Date().toISOString().slice(0, 10),
              duration: 45, // Default duration for custom workouts
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              exercises: foundWorkout.exercises.map(exercise => ({
                exerciseName: exercise.exerciseName,
                sets: exercise.sets || 3,
                reps: exercise.reps || 12,
                weight: exercise.weight || 0,
                completed: true
              })),
              completed: true,
              totalExercises: foundWorkout.exercises.length,
              completedExercises: foundWorkout.exercises.length,
              goal: foundWorkout.goal
            };

            if (!firebaseService) {
              setWorkoutSaved(false); // Reset flag on error
              return;
            }
            
            if (!saveWorkoutSession) {
              setWorkoutSaved(false); // Reset flag on error
              return;
            }
            
            await saveWorkoutSession(workoutSessionData);
          } catch (error) {
            setWorkoutSaved(false); // Reset flag on error to allow retry
          }
        }
      } catch (error) {
        console.error('Error loading workout:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadWorkout()
  }, [workoutId, loadCustomWorkouts])

  // Also check when customWorkouts updates
  useEffect(() => {
    if (customWorkouts.length > 0) {
      const foundWorkout = customWorkouts.find(w => w.id === parseInt(workoutId))
      if (foundWorkout && !workout) {
        setWorkout(foundWorkout)
        setIsLoading(false)
      }
    }
  }, [customWorkouts, workoutId, workout])

  if (isLoading) {
    return <div className="text-center text-ar-gray">Loading workout...</div>
  }

  if (!workout) {
    return <div className="text-center text-ar-gray">Workout not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <motion.div
        className="glass-card p-8 rounded-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
      >
        <motion.div
          className="text-8xl mb-6"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ✨
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">Custom Workout Complete!</h1>
        <p className="text-ar-gray text-lg mb-8">
          Great job completing {workout.name}
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={20} className="text-ar-violet" />
              <span className="font-bold">Goal</span>
            </div>
            <div className="text-2xl font-bold text-ar-violet">
              {workout.goal}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Dumbbell size={20} className="text-ar-blue" />
              <span className="font-bold">Exercises</span>
            </div>
            <div className="text-2xl font-bold text-ar-blue">
              {workout.exercises.length}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-ar-violet hover:bg-ar-violet/80 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-glow-violet text-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy size={20} />
              Dashboard
            </div>
          </button>

          <button
            onClick={() => navigate('/workout/custom/my-workouts')}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30"
          >
            My Workouts
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Main Workout Component
export default function Workout() {
  return (
    <Routes>
      <Route path="/" element={<WorkoutHub />} />
      <Route path="/:category" element={<CategorySelection />} />
      <Route path="/:category/:splitId" element={<SplitDetail />} />

      {/* Gym/Calisthenics routes (day-based) */}
      <Route path="/:category/:splitId/:dayId/session" element={<WorkoutSession />} />
      <Route path="/:category/:splitId/:dayId/session/:exerciseId/analyzer/:exerciseName" element={<FormAnalyzer />} />
      <Route path="/:category/:splitId/:dayId/complete" element={<WorkoutComplete />} />

      {/* Stretching/Yoga routes (sequence-based) */}
      <Route path="/:category/:splitId/session" element={<WorkoutSession />} />
      <Route path="/:category/:splitId/session/:exerciseId/analyzer/:exerciseName" element={<FormAnalyzer />} />
      <Route path="/:category/:splitId/complete" element={<WorkoutComplete />} />

      {/* Custom workout routes */}
      <Route path="/custom/builder" element={<CustomWorkoutBuilder />} />
      <Route path="/custom/my-workouts" element={<MyCustomWorkouts />} />
      <Route path="/custom/:workoutId/session" element={<CustomWorkoutSession />} />
      <Route path="/custom/:workoutId/complete" element={<CustomWorkoutComplete />} />
      <Route path="/custom/:workoutId/session/:exerciseId/analyzer/:exerciseName" element={<FormAnalyzer />} />
    </Routes>
  )
}