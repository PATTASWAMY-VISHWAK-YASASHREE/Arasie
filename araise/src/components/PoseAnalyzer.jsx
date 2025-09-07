import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  StopCircle, 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Play,
  Square,
  AlertTriangle,
  XCircle,
  Target,
  RotateCcw
} from 'lucide-react';
import { poseDetectionService } from '../utils/poseDetection';
import { webSocketService } from '../utils/websocket';
import { PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';

const PoseAnalyzer = ({ exerciseName, planId, level, onComplete, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ isConnected: false });
  const [poseStatus, setPoseStatus] = useState('Adjust');
  const [feedback, setFeedback] = useState('');
  const [reps, setReps] = useState(0);
  const [angle, setAngle] = useState(0);
  const [stage, setStage] = useState('');
  const [cameraPermission, setCameraPermission] = useState('prompt');

  // Start video feed display
  const startVideoFeed = useCallback(() => {
    const drawVideoFrame = () => {
      if (!videoRef.current || !canvasRef.current) {
        requestAnimationFrame(drawVideoFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Always draw the video feed
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Continue video feed
      requestAnimationFrame(drawVideoFrame);
    };
    
    drawVideoFrame();
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraPermission('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraPermission('granted');
        setError(null);
        
        // Start video feed display immediately
        startVideoFeed();
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraPermission('denied');
      setError(`Camera access failed: ${err.message}`);
    }
  }, [startVideoFeed]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Stop camera and disconnect from WebSocket - Complete cleanup function
  const stopCameraAndDisconnect = useCallback(() => {
    console.log('🛑 Starting complete cleanup - stopping camera and disconnecting WebSocket');
    
    // Stop recording if active
    if (isRecording) {
      setIsRecording(false);
      console.log('📹 Stopping recording');
    }
    
    // Cancel animation frame if running
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      console.log('🎬 Animation frame cancelled');
    }
    
    // Stop camera and release all tracks
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log(`📷 Stopped ${track.kind} track`);
      });
      videoRef.current.srcObject = null;
      console.log('📷 Camera stopped and video source cleared');
    }
    
    // Disconnect from WebSocket
    webSocketService.disconnect();
    setConnectionStatus({ isConnected: false });
    console.log('🔌 WebSocket disconnected');
    
    // Reset camera permission state
    setCameraPermission('prompt');
    // Reset states
    setIsInitialized(false);
    setReps(0);
    setAngle(0);
    setStage('');
    setFeedback('');
    setPoseStatus('Adjust');
    setError(null);
    onBack()
    console.log('✅ Complete cleanup finished');
  }, [isRecording]);

  // Initialize pose detection and websocket
  useEffect(() => {
    const initialize = async () => {
      try {
        setError(null);
        
        // Initialize pose detection
        await poseDetectionService.initialize();
        console.log('Pose detection initialized');
        
        // Connect to websocket with exercise parameter
        console.log('🔌 Connecting to WebSocket for exercise:', exerciseName);
        webSocketService.connectToExercise(exerciseName);
        
        // Set up websocket callbacks
        webSocketService.on('onConnect', () => {
          console.log('✅ WebSocket connected for exercise:', exerciseName);
          setConnectionStatus({ isConnected: true });
          
          // Test message reception immediately
          console.log('🧪 Testing WebSocket connection...');
        });
        
        webSocketService.on('onDisconnect', () => {
          console.log('WebSocket disconnected');
          setConnectionStatus({ isConnected: false });
        });
        
        webSocketService.on('onMessage', (data) => {
          console.log('🔵 WebSocket Message Received:', data);
          console.log('🔵 Message Type:', typeof data);
          console.log('🔵 All data keys:', Object.keys(data));
          console.log('🔵 Reps value:', data.reps, typeof data.reps);
          console.log('🔵 Feedback value:', data.feedback, typeof data.feedback);
          console.log('🔵 Stage value:', data.stage, typeof data.stage);
          console.log('🔵 Angle value:', data.angle, typeof data.angle);
          console.log('🔵 Exercise Match:', data.exercise, '===', exerciseName);
          
          // Handle any response with rep/feedback data
          let updated = false;
          
          // Update reps if present (try different field names)
          if (data.reps !== undefined) {
            console.log('🔄 Updating reps to:', data.reps);
            setReps(data.reps);
            updated = true;
          } else if (data.rep_count !== undefined) {
            console.log('🔄 Updating reps from rep_count:', data.rep_count);
            setReps(data.rep_count);
            updated = true;
          } else if (data.counter !== undefined) {
            console.log('🔄 Updating reps from counter:', data.counter);
            setReps(data.counter);
            updated = true;
          }
          
          // Update feedback if present
          if (data.feedback) {
            console.log('💬 Updating feedback:', data.feedback);
            setFeedback(data.feedback);
            updated = true;
          } else if (data.message) {
            console.log('💬 Updating feedback from message:', data.message);
            setFeedback(data.message);
            updated = true;
          }
          
          // Update stage if present
          if (data.stage) {
            console.log('📊 Updating stage:', data.stage);
            setStage(data.stage);
            setPoseStatus(data.stage === 'up' ? 'Good Form' : 'Adjust Position');
            updated = true;
          }
          
          // Update angle if present
          if (data.angle !== undefined) {
            console.log('📐 Updating angle:', data.angle);
            setAngle(data.angle);
            updated = true;
          }
          
          if (updated) {
            console.log('✅ UI updated with new data');
          } else {
            console.log('❌ No recognizable data to update UI');
            console.log('🔍 Raw data received:', JSON.stringify(data, null, 2));
          }
        });
        
        webSocketService.on('onError', (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus({ isConnected: false });
        });
        
        setIsInitialized(true);
        
        // Automatically start camera after initialization
        setTimeout(() => {
          startCamera();
        }, 100);
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(`Initialization failed: ${err.message}`);
      }
    };
    
    initialize();
    
    return () => {
      webSocketService.disconnect();
    };
  }, [exerciseName, startCamera]);   
  // Process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || cameraPermission !== 'granted') {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Always draw video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Always detect pose for visual feedback
      const timestamp = performance.now();
      const results = await poseDetectionService.detectPose(video, timestamp);

      if (results && results.landmarks && results.landmarks.length > 0) {
        console.log('🔍 Pose detected, landmarks count:', results.landmarks[0]?.length);
        
        // Check if pose is valid for the current exercise
        const isValidPose = poseDetectionService.isValidPose(results.landmarks, exerciseName);
        console.log('✅ Pose valid for', exerciseName, ':', isValidPose);
          
        setPoseStatus(isValidPose ? 'Good Form' : 'Adjust');

        // Always draw pose skeleton for visual feedback
        if (results.landmarks[0]) {
          // Draw pose connections
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2;
          
          // Draw connections manually using MediaPipe landmarks
          const landmarks = results.landmarks[0];
          const connections = [
            [11, 12], [12, 14], [14, 16], [11, 13], [13, 15], // Arms
            [12, 24], [11, 23], [24, 26], [26, 28], [23, 25], [25, 27], // Body and legs
            [24, 23] // Hip connection
          ];

          connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
              ctx.beginPath();
              ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
              ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
              ctx.stroke();
            }
          });

          // Draw landmarks
          ctx.fillStyle = '#FF0000';
          landmarks.forEach((landmark) => {
            if (landmark.visibility > 0.5) {
              ctx.beginPath();
              ctx.arc(
                landmark.x * canvas.width,
                landmark.y * canvas.height,
                4,
                0,
                2 * Math.PI
              );
              ctx.fill();
            }
          });
        }

        // Send coordinates to backend only when recording
        console.log('🎮 Current recording state:', isRecording);
        if (isRecording) {
          console.log('📊 About to extract coordinates for:', exerciseName);
          const coordinatesData = poseDetectionService.extractCoordinatesForExercise(
            results.landmarks, 
            exerciseName, 
            canvas.width, 
            canvas.height
          );
          
          console.log('🎯 Extracted coordinates:', coordinatesData);
          console.log('📊 Pose valid:', isValidPose);
          console.log('🔗 WebSocket connected:', connectionStatus.isConnected);

          if (coordinatesData && isValidPose && connectionStatus.isConnected) {
            const payload = {
              ...coordinatesData,
              planId,
              level
            };
            console.log('📤 Sending coordinates:', payload);
            console.log('🎯 Exercise:', exerciseName, 'Recording:', isRecording);
            const sent = webSocketService.sendCoordinates(payload);
            console.log('📡 Send result:', sent);
          } else {
            console.log('❌ Not sending coordinates:', {
              hasCoords: !!coordinatesData,
              isValidPose,
              isConnected: connectionStatus.isConnected,
              isRecording
            });
          }
        } else {
          console.log('⏸️ Not recording, skipping coordinate extraction');
        }
      } else {
        setPoseStatus('No Pose Detected');
      }
    } catch (err) {
      console.error('Frame processing error:', err);
      setPoseStatus('Detection Error');
    }

    // Continue processing regardless of recording state
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [cameraPermission, exerciseName, planId, level, connectionStatus.isConnected, isRecording]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!isInitialized) {
      setError('System not initialized');
      return;
    }

    setIsRecording(true);
    setReps(0);
    setFeedback('Position yourself in frame and start the exercise');
    
    // Send workout start signal
    webSocketService.sendWorkoutStart(exerciseName, planId, level);
    
    // Start processing frames
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isInitialized, exerciseName, planId, level, processFrame]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Send workout end signal
    webSocketService.sendWorkoutEnd(exerciseName);
    
    setFeedback('Recording stopped. Great job!');
  }, [exerciseName]);

  
  // Start video processing when camera is granted
  useEffect(() => {
    if (cameraPermission === 'granted' && isInitialized && videoRef.current) {
      // Start the video processing loop
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraPermission, isInitialized, processFrame]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="min-h-screen bg-ar-black flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-ar-black/80 backdrop-blur-sm z-10">
        <button
          onClick={stopCameraAndDisconnect}
          className="flex items-center gap-2 text-ar-gray hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
          <span>Back</span>
        </button>
        
        <div className="text-white font-medium text-lg">{exerciseName}</div>
        
        <div className="w-16" />
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="mx-4 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* AI Assistant Loading Overlay */}
      {(!isInitialized || !connectionStatus.isConnected) && !error && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-ar-black/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 mx-4 max-w-sm w-full border border-ar-blue/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-center">
              {/* Animated Robot/AI Icon */}
              <motion.div
                className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-ar-blue to-ar-violet rounded-full flex items-center justify-center">
                  <Target size={32} className="text-white sm:w-10 sm:h-10" />
                </div>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-ar-blue/20 to-ar-violet/20 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {/* Loading Text */}
              <motion.h2
                className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Connecting to your AI assistant
              </motion.h2>
              
              <motion.p
                className="text-ar-gray-400 text-sm sm:text-base mb-4 sm:mb-6"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                Setting up pose detection model...
              </motion.p>
              
              {/* Progress Indicator */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={`flex items-center gap-2 ${isInitialized ? 'text-green-400' : 'text-ar-gray-400'}`}>
                    {isInitialized ? (
                      <CheckCircle size={16} />
                    ) : (
                      <motion.div
                        className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-ar-blue border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    Pose Detection
                  </span>
                  {isInitialized && <span className="text-green-400 text-xs">✓</span>}
                </div>
                
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={`flex items-center gap-2 ${connectionStatus.isConnected ? 'text-green-400' : 'text-ar-gray-400'}`}>
                    {connectionStatus.isConnected ? (
                      <CheckCircle size={16} />
                    ) : (
                      <motion.div
                        className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-ar-violet border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    AI Assistant
                  </span>
                  {connectionStatus.isConnected && <span className="text-green-400 text-xs">✓</span>}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-ar-gray-800 rounded-full h-1 sm:h-2 mt-4 sm:mt-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-ar-blue to-ar-violet"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: isInitialized && connectionStatus.isConnected ? "100%" : 
                           isInitialized ? "50%" : "25%"
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
              
              {/* Status Text */}
              <motion.p
                className="text-ar-gray-500 text-xs sm:text-sm mt-3 sm:mt-4"
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isInitialized && connectionStatus.isConnected ? 
                  "Ready to start workout!" :
                  isInitialized ? 
                  "Connecting to AI assistant..." : 
                  "Loading pose detection..."
                }
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Video Container - Full Width, responsive height */}
      <div className="flex-1 relative bg-gray-900 min-h-[60vh] max-h-[70vh]">
        {/* Video and Canvas */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          style={{ display: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          width={640}
          height={480}
        />

        {/* Top Video Overlay - Dot, Reps, Angle */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4">
          <div className="flex items-center justify-between gap-2">
            {/* Connection Status Dot - Left */}
            <div className="flex items-center flex-shrink-0">
              <div className={`w-4 h-4 rounded-full shadow-lg ${
                connectionStatus.isConnected ? 'bg-green-400' : 'bg-red-400'
              }`} />
            </div>
            
            {/* Rep Counter - Middle */}
            <div className="flex items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex-shrink-0">
              <Activity size={14} className="text-ar-blue" />
              <span className="text-white text-xs sm:text-sm font-bold">Reps: {reps}</span>
            </div>

            {/* Current Angle - Right */}
            <div className="flex items-center gap-1 sm:gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 flex-shrink-0">
              <RotateCcw size={12} className="text-orange-400" />
              <span className="text-white text-xs sm:text-sm font-bold">
                Angle: {angle > 0 ? `${angle.toFixed(0)}°` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Camera Permission Request */}
        {cameraPermission === 'prompt' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
            <div className="text-center text-white">
              <Camera size={48} className="mx-auto mb-4 text-ar-blue" />
              <p className="mb-4">Camera access required for pose detection</p>
              <button
                onClick={startCamera}
                className="bg-ar-blue hover:bg-ar-blue/80 px-6 py-2 rounded-lg transition-colors"
              >
                Enable Camera
              </button>
            </div>
          </div>
        )}

        {/* Camera Loading */}
        {cameraPermission === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ar-blue mx-auto mb-4"></div>
              <p>Requesting camera access...</p>
            </div>
          </div>
        )}

        {/* Camera Denied */}
        {cameraPermission === 'denied' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
            <div className="text-center text-white">
              <XCircle size={48} className="mx-auto mb-4 text-red-400" />
              <p className="mb-4">Camera access denied</p>
              <button
                onClick={startCamera}
                className="bg-ar-blue hover:bg-ar-blue/80 px-6 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Pose Status at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className={`backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 ${
            poseStatus === 'Good Form' ? 'bg-green-500/80' : 'bg-yellow-500/80'
          }`}>
            <AlertTriangle size={16} className="text-white" />
            <span className="text-white text-xs sm:text-sm font-medium">{poseStatus}</span>
          </div>
        </div>

        {/* Feedback at Bottom Center/Right - Stack on mobile */}
        {feedback && (
          <div className="absolute bottom-4 right-4 z-20 max-w-[200px] sm:max-w-xs">
            <motion.div
              className="bg-ar-blue/80 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-white text-xs sm:text-sm font-medium break-words">{feedback}</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Controls - Always accessible with proper spacing */}
      <div className="p-4 pb-6 bg-ar-black/90 backdrop-blur-sm border-t border-gray-800 safe-area-bottom">
        <div className="flex gap-3 justify-center max-w-sm mx-auto">
          <button
            onClick={stopCameraAndDisconnect}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex-1 text-sm"
          >
            Back
          </button>
          
          {cameraPermission === 'granted' && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isInitialized || !connectionStatus.isConnected}
              className={`font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 flex-1 text-sm ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-ar-blue hover:bg-ar-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Square size={18} />
                  Stop
                </>
              ) : (
                <>
                  <Play size={18} />
                  Start
                </>
              )}
            </button>
          )}

          {reps > 0 && (
            <button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex-1 text-sm"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoseAnalyzer;
