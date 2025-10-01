import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, AlertTriangle } from "lucide-react";

export default function DeleteTaskModal({ isOpen, onClose, task, onDeleteThis, onDeleteSeries }) {
  if (!task) return null;

  const isRepeatingTask = task.isRepeating || task.originalTaskId;

  const handleDeleteThis = () => {
    onDeleteThis(task.id);
    onClose();
  };

  const handleDeleteSeries = () => {
    onDeleteSeries(task.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card p-6 rounded-2xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <h2 className="text-xl font-hagrid font-light text-ar-white">Delete Task</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-ar-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-ar-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <div className="text-ar-white font-medium mb-2">
                "{task.name || task.title}"
              </div>

              {isRepeatingTask ? (
                <div className="space-y-3">
                  <p className="text-ar-gray-300 text-sm">
                    This is a repeated task. What would you like to delete?
                  </p>

                  <div className="bg-ar-gray-800/50 rounded-lg p-3 border border-ar-gray-700">
                    <div className="text-xs text-ar-gray-400 mb-1">Options:</div>
                    <div className="text-sm text-ar-gray-300">
                      • <strong>This occurrence:</strong> Delete only this specific task
                    </div>
                    <div className="text-sm text-ar-gray-300">
                      • <strong>Entire series:</strong> Delete all occurrences of this repeated task
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-ar-gray-300 text-sm">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>

              {isRepeatingTask ? (
                <>
                  <button
                    onClick={handleDeleteThis}
                    className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    This Only
                  </button>
                  <button
                    onClick={handleDeleteSeries}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Entire Series
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDeleteThis}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Task
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}