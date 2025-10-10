import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

const VoiceIndicator = ({ isSpeaking, isMuted, onToggleMute }) => {
  // Animation for voice bars
  const barVariants = {
    speaking: {
      scaleY: [1, 2, 1.5, 1.8, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    idle: {
      scaleY: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Different delay for each bar to create wave effect
  const barDelays = [0, 0.1, 0.2, 0.15, 0.05];

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isSpeaking || !isMuted ? 1 : 0.7, 
        y: 0 
      }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-card px-4 py-3 rounded-2xl flex items-center gap-3 bg-ar-black/80 backdrop-blur-md border border-ar-gray/20">
        {/* Voice Toggle Button */}
        <button
          onClick={onToggleMute}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isMuted 
              ? 'bg-ar-gray/20 text-ar-gray hover:bg-ar-gray/30' 
              : 'bg-ar-violet/20 text-ar-violet hover:bg-ar-violet/30'
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        {/* Voice Animation Bars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              className={`w-1 h-4 rounded-full ${
                isSpeaking && !isMuted 
                  ? 'bg-ar-violet' 
                  : 'bg-ar-gray/40'
              }`}
              variants={barVariants}
              animate={isSpeaking && !isMuted ? "speaking" : "idle"}
              transition={{
                ...barVariants.speaking.transition,
                delay: barDelays[index]
              }}
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="text-xs font-medium">
          {isMuted ? (
            <span className="text-ar-gray">Voice Off</span>
          ) : isSpeaking ? (
            <motion.span 
              className="text-ar-violet"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Speaking...
            </motion.span>
          ) : (
            <span className="text-ar-gray">Voice Ready</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceIndicator;