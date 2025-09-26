import { motion, AnimatePresence } from "framer-motion"
import { Pause, Play, Square, NotebookPen } from "lucide-react"

export default function FocusTimerBar({ visible, remaining, mode = 'Pomodoro', taskName, isPaused, onPause, onResume, onEnd, onNote, cycles = 1, currentCycle = 1, breakDuration = 5, completedBreaks = 0 }) {
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0')
  const ss = Math.floor(remaining % 60).toString().padStart(2, '0')
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96%] md:w-[92%] max-w-3xl safe-area-bottom mobile-bottom-offset">
          <div className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 border border-ar-gray-700/60">
            {/* Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <div className="min-w-0 flex-1 w-full md:w-auto">
                <div className="text-xs text-ar-gray-400 truncate">Focus Mode: {mode}</div>
                <div className="text-ar-white text-sm font-medium truncate">{taskName || 'Untitled task'}</div>
                {cycles > 1 && (
                  <div className="text-xs text-ar-gray-400 mt-1 truncate">
                    Cycle {currentCycle}/{cycles} • {completedBreaks} break{completedBreaks !== 1 ? 's' : ''} completed
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 w-full md:w-auto justify-between md:justify-end">
                <div className="text-ar-white font-mono text-lg md:text-lg">{mm}:{ss}</div>
                <div className="flex items-center gap-1">
                  {isPaused ? (
                    <button onClick={onResume} className="p-2 rounded bg-ar-blue/20 text-ar-blue hover:bg-ar-blue/30"><Play size={14} /></button>
                  ) : (
                    <button onClick={onPause} className="p-2 rounded bg-ar-gray-700 text-ar-gray-200 hover:bg-ar-gray-600"><Pause size={14} /></button>
                  )}
                  <button onClick={onEnd} className="p-2 rounded bg-red-600/30 text-red-300 hover:bg-red-600/40"><Square size={14} /></button>
                  <button onClick={onNote} className="p-2 rounded bg-ar-gray-700 text-ar-gray-200 hover:bg-ar-gray-600"><NotebookPen size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


