import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Smartphone } from 'lucide-react';

const CameraSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const [selectedCamera, setSelectedCamera] = useState(null);

  const handleCameraSelect = (facingMode) => {
    setSelectedCamera(facingMode);
  };

  const handleConfirm = () => {
    if (selectedCamera) {
      onSelect(selectedCamera);
      setSelectedCamera(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedCamera(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-6 rounded-3xl max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ar-violet/20 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-ar-violet" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Camera Selection</h2>
                    <p className="text-ar-gray text-sm">Choose your preferred camera</p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 rounded-full bg-ar-gray/20 flex items-center justify-center hover:bg-ar-gray/30 transition-colors"
                >
                  <X className="w-4 h-4 text-ar-gray" />
                </button>
              </div>

              {/* Camera Options */}
              <div className="space-y-3 mb-6">
                {/* Front Camera Option */}
                <motion.button
                  onClick={() => handleCameraSelect('user')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedCamera === 'user'
                      ? 'border-ar-violet bg-ar-violet/10'
                      : 'border-ar-gray/20 hover:border-ar-violet/50 bg-ar-gray/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedCamera === 'user' ? 'bg-ar-violet/20' : 'bg-ar-gray/20'
                    }`}>
                      <Smartphone className={`w-6 h-6 ${
                        selectedCamera === 'user' ? 'text-ar-violet' : 'text-ar-gray'
                      }`} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className={`font-semibold ${
                        selectedCamera === 'user' ? 'text-ar-violet' : 'text-white'
                      }`}>
                        Front Camera
                      </h3>
                      <p className="text-ar-gray text-sm">
                        Self-facing camera for selfie mode
                      </p>
                    </div>
                    {selectedCamera === 'user' && (
                      <div className="w-5 h-5 bg-ar-violet rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </motion.button>

                {/* Back Camera Option */}
                <motion.button
                  onClick={() => handleCameraSelect('environment')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedCamera === 'environment'
                      ? 'border-ar-violet bg-ar-violet/10'
                      : 'border-ar-gray/20 hover:border-ar-violet/50 bg-ar-gray/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedCamera === 'environment' ? 'bg-ar-violet/20' : 'bg-ar-gray/20'
                    }`}>
                      <Camera className={`w-6 h-6 ${
                        selectedCamera === 'environment' ? 'text-ar-violet' : 'text-ar-gray'
                      }`} />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className={`font-semibold ${
                        selectedCamera === 'environment' ? 'text-ar-violet' : 'text-white'
                      }`}>
                        Back Camera
                      </h3>
                      <p className="text-ar-gray text-sm">
                        Rear-facing camera for better quality
                      </p>
                    </div>
                    {selectedCamera === 'environment' && (
                      <div className="w-5 h-5 bg-ar-violet rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 rounded-xl bg-ar-gray/20 text-ar-gray hover:bg-ar-gray/30 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedCamera}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    selectedCamera
                      ? 'bg-ar-violet text-white hover:bg-ar-violet-dark'
                      : 'bg-ar-gray/20 text-ar-gray/50 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CameraSelectionModal;