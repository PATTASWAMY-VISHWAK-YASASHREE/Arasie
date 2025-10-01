import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  CheckCircle, 
  Camera, 
  Dumbbell,
  Users,
  Heart
} from "lucide-react"
import { workoutData } from "../../data/workoutData"

// Workout Session Component
export default function WorkoutSession() {
  const { category, splitId, dayId } = useParams()
  const navigate = useNavigate()
  const [currentExercise, setCurrentExercise] = useState(0)
  
  const getSessionData = () => {
    const splitData = workoutData[category]?.[splitId]
    if (!splitData) return null
    
    // Handle sequence-based (stretching & yoga)
    if (splitData.sequence) {
      return {
        name: splitData.name,
        exercises: splitData.sequence.map((pose, index) => ({
          id: index + 1,
          exerciseName: pose.pose,
          reps: pose.duration,
          description: pose.description,
          pose_analyzer: false,
          isPose: true
        }))
      }
    }
    
    // Handle day-based (gym/calisthenics)
    if (dayId && splitData.days?.[dayId]) {
      return {
        name: splitData.days[dayId].splitDay,
        exercises: splitData.days[dayId].exercises
      }
    }
    
    return null
  }

  const sessionData = getSessionData()

  if (!sessionData) {
    return <div className="text-center text-ar-gray">Session not found</div>
  }

  const exercise = sessionData.exercises[currentExercise]
  const isLastExercise = currentExercise === sessionData.exercises.length - 1

  const handleNext = () => {
    if (isLastExercise) {
      const completePath = dayId 
        ? `/workout/${category}/${splitId}/${dayId}/complete`
        : `/workout/${category}/${splitId}/complete`
      navigate(completePath)
    } else {
      setCurrentExercise(currentExercise + 1)
    }
  }

  const handleAnalyzer = () => {
    const analyzerPath = dayId
      ? `/workout/${category}/${splitId}/${dayId}/session/${exercise.id}/analyzer/${exercise.uniqueName}`
      : `/workout/${category}/${splitId}/session/${exercise.id}/analyzer/${exercise.uniqueName}`
    navigate(analyzerPath)
  }

  const getExerciseIcon = () => {
    if (exercise.isPose) return Heart
    if (category === 'calisthenics') return Users
    return Dumbbell
  }

  const getColorClasses = () => {
    if (exercise.isPose) {
      return {
        text: 'text-ar-green',
        bg: 'bg-ar-green',
        bgLight: 'bg-ar-green/20',
        hover: 'hover:bg-ar-green/80',
        shadow: 'hover:shadow-glow-green'
      }
    }
    if (category === 'calisthenics') {
      return {
        text: 'text-ar-violet',
        bg: 'bg-ar-violet',
        bgLight: 'bg-ar-violet/20',
        hover: 'hover:bg-ar-violet/80',
        shadow: 'hover:shadow-glow-violet'
      }
    }
    return {
      text: 'text-ar-blue',
      bg: 'bg-ar-blue',
      bgLight: 'bg-ar-blue/20',
      hover: 'hover:bg-ar-blue/80',
      shadow: 'hover:shadow-glow-blue'
    }
  }

  const ExerciseIcon = getExerciseIcon()
  const colors = getColorClasses()

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
          <span className={`${colors.text} font-bold`}>
            {currentExercise + 1} / {sessionData.exercises.length}
          </span>
        </div>
        <div className="w-full bg-ar-dark-gray rounded-full h-3">
          <motion.div
            className={`${colors.bg} h-3 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${((currentExercise + 1) / sessionData.exercises.length) * 100}%` }}
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
        <div className={`w-64 h-96 md:w-72 md:h-[28rem] mx-auto mb-3 md:mb-4 ${colors.bgLight} rounded-2xl overflow-hidden`}>
          <div className="w-full h-full flex items-center justify-center">
            {exercise.video ? (
              <video
                src={exercise.video}
                autoPlay
                loop
                playsInline
                muted
                className="w-full h-full object-cover rounded-xl bg-black"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-ar-gray">
                Video not available
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{exercise.exerciseName}</h2>
        <p className={`${colors.text} text-lg md:text-xl font-bold mb-1`}>
          {exercise.sets ? `${exercise.sets} sets × ${exercise.reps} reps` : exercise.reps}
        </p>
        <p className="text-ar-gray mb-3 md:mb-4">{exercise.description}</p>

        <div className="flex flex-col gap-2 md:gap-3 justify-center px-4 md:px-0">
          {exercise.pose_analyzer && (
            <button
              onClick={handleAnalyzer}
              className="w-full bg-ar-violet hover:bg-ar-violet/80 text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 hover:shadow-glow-violet"
            >
              <div className="flex items-center justify-center gap-2">
                <Camera size={18} className="md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Form Analyzer</span>
              </div>
            </button>
          )}
          
          <button
            onClick={handleNext}
            className={`w-full ${colors.bg} ${colors.hover} text-white font-bold py-3 md:py-4 rounded-xl transition-all duration-300 ${colors.shadow}`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={18} className="md:w-5 md:h-5" />
              <span className="text-sm md:text-base">
                {isLastExercise ? 'Finish Session' : 'Exercise Done'}
              </span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}