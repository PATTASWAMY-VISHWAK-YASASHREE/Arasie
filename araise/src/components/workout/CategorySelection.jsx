import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Clock, 
  Target,
  BarChart3,
  Dumbbell,
  Heart,
  Sparkles,
  Leaf,
  Plus,
  Play,
  Trash2
} from "lucide-react"
import { workoutData } from "../../data/workoutData"
import { useUserStore } from "../../store/userStore"

// Category Selection (Gym, Calisthenics, etc.)
export default function CategorySelection() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { customWorkouts, loadCustomWorkouts, deleteCustomWorkout } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)

  // Load custom workouts when on custom category
  useEffect(() => {
    if (category === 'custom') {
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
    }
  }, [category, loadCustomWorkouts])

  const handleDeleteWorkout = async (id) => {
    try {
      await deleteCustomWorkout(id)
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }
  
  const getCategoryData = () => {
    switch(category) {
      case 'gym':
        return {
          title: 'Gym Workouts',
          description: 'Choose your training split',
          splits: Object.entries(workoutData.gym).map(([key, split]) => ({
            id: key,
            ...split,
            icon: key === 'ppl' ? BarChart3 : Dumbbell
          }))
        }
      case 'calisthenics':
        return {
          title: 'Calisthenics',
          description: 'Bodyweight training programs',
          splits: Object.entries(workoutData.calisthenics).map(([key, split]) => ({
            id: key,
            ...split,
            icon: key === 'beginner' ? Heart : Target
          }))
        }
      case 'stretching':
        return {
          title: 'Stretching & Yoga',
          description: 'Flexibility and recovery routines',
          splits: Object.entries(workoutData.stretching).map(([key, routine]) => ({
            id: key,
            ...routine,
            icon: key === 'morning' ? Sparkles : 
                  key === 'beginnerFlow' || key === 'sleepYoga' ? Heart : Leaf
          }))
        }
      default:
        return { title: 'Workouts', description: '', splits: [] }
    }
  }

  const categoryData = getCategoryData()

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
          <h1 className="text-4xl font-bold">{categoryData.title}</h1>
          <p className="text-ar-gray">{categoryData.description}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryData.splits.map((split, index) => {
          const IconComponent = split.icon
          return (
            <motion.div
              key={split.id}
              className="glass-card p-6 rounded-2xl cursor-pointer hover:border-ar-blue/50 transition-all duration-300 group"
              onClick={() => navigate(`/workout/${category}/${split.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-ar-blue/20 group-hover:bg-ar-blue/30 transition-colors duration-300">
                  <IconComponent size={24} className="text-ar-blue" />
                </div>
                <h3 className="text-xl font-bold">{split.name}</h3>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-ar-gray text-sm">
                  <Clock size={14} />
                  <span>{split.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-ar-gray text-sm">
                  <Target size={14} />
                  <span>{split.type}</span>
                </div>
              </div>
              
              <p className="text-ar-gray text-sm mb-6 leading-relaxed">
                {split.description}
              </p>
              
              <button className="w-full bg-ar-blue/20 hover:bg-ar-blue/30 text-ar-blue font-bold py-3 rounded-xl transition-all duration-300 border border-ar-blue/30 hover:border-ar-blue/50">
                Start Plan
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Custom Workout Builder for Custom category */}
      {category === 'custom' && (
        <>
          <motion.div
            className="glass-card p-8 rounded-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-full bg-ar-violet/20 w-fit mx-auto mb-4">
                <Plus size={32} className="text-ar-violet" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Create Custom Workout</h3>
              <p className="text-ar-gray mb-6">
                Mix and match exercises from gym, calisthenics, stretching, and yoga to create your perfect routine
              </p>
              <button
                onClick={() => navigate('/workout/custom/builder')}
                className="bg-ar-violet hover:bg-ar-violet/80 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 hover:shadow-glow-violet"
              >
                Start Building
              </button>
            </div>
          </motion.div>

          {/* My Custom Workouts Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Workouts</h2>
              {customWorkouts.length > 0 && (
                <button
                  onClick={() => navigate('/workout/custom/my-workouts')}
                  className="text-ar-blue hover:text-ar-blue/80 text-sm font-medium transition-colors duration-300"
                >
                  View All
                </button>
              )}
            </div>

            {isLoading ? (
              <motion.div
                className="glass-card p-6 rounded-2xl text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-4xl mb-3">⏳</div>
                <h3 className="text-lg font-bold mb-2">Loading Workouts...</h3>
              </motion.div>
            ) : customWorkouts.length === 0 ? (
              <motion.div
                className="glass-card p-6 rounded-2xl text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-4xl mb-3">💪</div>
                <h3 className="text-lg font-bold mb-2">No Custom Workouts Yet</h3>
                <p className="text-ar-gray text-sm">
                  Create your first custom workout to get started
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customWorkouts.slice(0, 6).map((workout, index) => (
                  <motion.div
                    key={workout.id}
                    className="glass-card p-4 rounded-xl group hover:border-ar-violet/50 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1 line-clamp-1">
                          {workout.name}
                        </h4>
                        <p className="text-ar-violet text-xs mb-1 capitalize">
                          {workout.goal || 'Custom'}
                        </p>
                        <p className="text-ar-gray text-xs">
                          {workout.exercises.length} exercises
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWorkout(workout.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-all duration-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/workout/custom/${workout.id}/session`)}
                      className="w-full bg-ar-violet/20 hover:bg-ar-violet/30 text-ar-violet font-bold py-2 rounded-lg transition-all duration-300 border border-ar-violet/30 hover:border-ar-violet/50 text-sm"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Play size={14} />
                        Start Workout
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {customWorkouts.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/workout/custom/my-workouts')}
                  className="text-ar-violet hover:text-ar-violet/80 font-medium transition-colors duration-300"
                >
                  View All {customWorkouts.length} Workouts →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}