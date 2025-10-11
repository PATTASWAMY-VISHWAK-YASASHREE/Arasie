import { useState } from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useUserStore } from "../../store/userStore"
import MeditationSession from "./MeditationSession"

const meditations = [
  { 
    id: 'bodyscan', 
    name: 'Body Scan', 
    description: 'Mindful body awareness for deep relaxation',
    duration: '10 min',
    image: './images/mental-health/mini meditation/bodyscan.jpeg',
    audioSrc: '/sounds/mental-health/mediation/bodyscan.mp3'
  },
  { 
    id: 'mantra', 
    name: 'Mantra Meditation', 
    description: 'Sacred sounds for inner peace and focus',
    duration: '8 min',
    image: './images/mental-health/mini meditation/mantra-meditation.jpg',
    audioSrc: '/sounds/mental-health/mediation/mantra-meditation.mp3'
  },
  { 
    id: 'mindfulness', 
    name: 'Mindfulness', 
    description: 'Present moment awareness practice',
    duration: '12 min',
    image: './images/mental-health/mini meditation/mindfulness.jpg',
    audioSrc: '/sounds/mental-health/mediation/mindfulness.mp3'
  },
  { 
    id: 'selflove', 
    name: 'Self Love', 
    description: 'Compassionate meditation for self-acceptance',
    duration: '15 min',
    image: './images/mental-health/mini meditation/selflove.jpg',
    audioSrc: '/sounds/mental-health/mediation/selflove.mp3'
  },
]

export default function MiniMeditation({ onBack }) {
  const [selectedMeditation, setSelectedMeditation] = useState(null)
  const { updateMentalHealthProgress } = useUserStore()

  const handleStartMeditation = (meditation) => {
    setSelectedMeditation(meditation)
    // Give initial progress for starting meditation
    updateMentalHealthProgress(10)
  }

  const handleBackToList = () => {
    setSelectedMeditation(null)
  }

  if (selectedMeditation) {
    return (
      <MeditationSession 
        meditation={selectedMeditation} 
        onBack={handleBackToList}
      />
    )
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {meditations.map((meditation) => (
          <motion.div
            key={meditation.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 group hover:scale-105 transition-all duration-300"
          >
            {/* Background Image */}
            <img 
              src={meditation.image}
              alt={meditation.name}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
              onError={(e) => {
                console.log(`Failed to load image: ${meditation.image}`)
                e.target.style.display = 'none'
              }}
            />

            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="relative p-3 sm:p-6 aspect-[2/3] flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-lg sm:text-2xl md:text-3xl font-hagrid font-bold text-white mb-1 sm:mb-3 leading-tight">{meditation.name}</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-2">{meditation.description}</p>
                <p className="text-purple-300 text-xs sm:text-sm font-medium">{meditation.duration}</p>
              </div>
              
              <button
                onClick={() => handleStartMeditation(meditation)}
                className="w-full py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base font-medium transition-all duration-300 border-2 bg-transparent border-purple-500 text-purple-400 hover:bg-purple-500/10 backdrop-blur-sm mt-2 sm:mt-0"
              >
                <Play size={16} className="inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Start Session</span>
                <span className="sm:hidden">Start</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}