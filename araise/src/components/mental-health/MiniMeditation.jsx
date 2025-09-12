import { motion } from "framer-motion"
import { useUserStore } from "../../store/userStore"

const meditations = [
  { id: 'calm', name: '2-Min Calm', duration: '2 min', color: 'bg-blue-500' },
  { id: 'focus', name: '3-Min Focus', duration: '3 min', color: 'bg-purple-500' },
  { id: 'sleep', name: '5-Min Sleep', duration: '5 min', color: 'bg-indigo-500' },
]

export default function MiniMeditation({ onBack }) {
  const { updateMentalHealthProgress } = useUserStore()

  const handleStartMeditation = (meditation) => {
    updateMentalHealthProgress(75)
    alert(`Starting ${meditation.name} meditation... 🧘‍♀️`)
  }

  return (
    <div className="max-w-2xl mx-auto pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          onClick={onBack}
          className="text-ar-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-hagrid font-light text-ar-white">🧘 Mini Meditation</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meditations.map((meditation) => (
          <motion.div
            key={meditation.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-2xl text-center"
          >
            <h3 className="text-lg font-hagrid font-light text-ar-white mb-2">{meditation.name}</h3>
            <p className="text-ar-gray-400 text-sm mb-4">{meditation.duration}</p>
            <button
              onClick={() => handleStartMeditation(meditation)}
              className={`w-full ${meditation.color} hover:opacity-90 text-white py-3 rounded-xl transition-all`}
            >
              Start Session
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}