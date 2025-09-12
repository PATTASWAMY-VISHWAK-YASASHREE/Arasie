import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import { useUserStore } from "../../store/userStore"

const sounds = [
  { id: 'rain', name: 'Rain', emoji: '🌧️' },
  { id: 'ocean', name: 'Ocean Waves', emoji: '🌊' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'white-noise', name: 'White Noise', emoji: '⚪' },
]

export default function SoundHealing({ onBack }) {
  const [playingSound, setPlayingSound] = useState(null)
  const { updateMentalHealthProgress } = useUserStore()

  const handlePlaySound = (soundId) => {
    setPlayingSound(playingSound === soundId ? null : soundId)
    if (playingSound !== soundId) {
      updateMentalHealthProgress(30)
    }
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
        <h1 className="text-2xl font-hagrid font-light text-ar-white">🎧 Sound Healing</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sounds.map((sound) => (
          <motion.div
            key={sound.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">{sound.emoji}</div>
              <h3 className="text-lg font-hagrid font-light text-ar-white mb-4">{sound.name}</h3>
              <button
                onClick={() => handlePlaySound(sound.id)}
                className={`w-full py-3 rounded-xl transition-colors ${
                  playingSound === sound.id
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {playingSound === sound.id ? (
                  <>
                    <Pause size={16} className="inline mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={16} className="inline mr-2" />
                    Play
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}