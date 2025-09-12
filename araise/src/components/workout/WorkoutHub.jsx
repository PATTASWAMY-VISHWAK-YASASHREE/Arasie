import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

// Workout Hub (Landing Page)
export default function WorkoutHub() {
  const navigate = useNavigate()

  const workoutCategories = [
    {
      id: 'gym',
      title: 'Gym Workouts',
      description: 'Structured splits for strength and hypertrophy',
      backgroundImage: '/images/workout-categories/gym.jpg',
      color: 'blue'
    },
    {
      id: 'calisthenics',
      title: 'Calisthenics',
      description: 'Bodyweight mastery and skill progression',
      backgroundImage: '/images/workout-categories/calisthenics.jpg',
      color: 'violet'
    },
    {
      id: 'stretching',
      title: 'Stretching & Yoga',
      description: 'Flexibility routines for recovery and wellness',
      backgroundImage: '/images/workout-categories/yoga.png',
      color: 'green'
    },
    {
      id: 'custom',
      title: 'Custom Workouts',
      description: 'Build your own hybrid training routines',
      backgroundImage: '/images/workout-categories/custom.jpg', // Using gym image as fallback for now
      color: 'orange'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Workout Hub</h1>
        <p className="text-ar-gray text-lg">
          Choose your training style and start your fitness journey
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {workoutCategories.map((category, index) => {
          return (
            <motion.div
              key={category.id}
              className="relative h-48 sm:h-64 md:h-80 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden border border-white/10 hover:border-white/30"
              onClick={() => navigate(`/workout/${category.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${category.backgroundImage})` }}
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-all duration-300" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-3 sm:p-4 md:p-8">
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 sm:mb-3 group-hover:text-white/90 transition-colors duration-300 leading-tight">
                    {category.title}
                  </h3>

                  <p className="text-white/80 mb-3 sm:mb-4 md:mb-6 leading-relaxed group-hover:text-white/70 transition-colors duration-300 text-xs sm:text-sm md:text-base text-center">
                    {category.description}
                  </p>

                  <button className="w-full font-bold py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:border-white/50 hover:shadow-lg transform group-hover:translate-y-0 translate-y-1 text-xs sm:text-sm md:text-base">
                    Explore Workouts
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-t from-${category.color}-500/30 to-transparent`} />
            </motion.div>
          )
        })}
      </div>


    </div>
  )
}