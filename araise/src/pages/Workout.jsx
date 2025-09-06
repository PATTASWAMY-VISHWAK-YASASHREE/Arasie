import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  Dumbbell, 
  Target, 
  Zap, 
  Play, 
  CheckCircle, 
  Camera, 
  ArrowLeft, 
  Clock,
  Flame,
  Trophy,
  Star
} from "lucide-react"
import { useUserStore } from "../store/userStore"
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

// Mock workout data
const workoutPlans = {
  beginner: [
    {
      id: 'beginner-1',
      title: 'Basic Strength',
      duration: '20 mins',
      calories: '150 cal',
      description: 'Perfect for getting started with strength training',
      exercises: [
        { id: 1, name: 'Biceps', reps: '3 sets × 8-12 reps', description: 'Classic upper body exercise' },
        { id: 2, name: 'Squats', reps: '3 sets × 10-15 reps', description: 'Great for leg strength' },
        { id: 3, name: 'Push-ups', reps: '3 sets × 30 seconds', description: 'Core stability exercise' },
        { id: 4, name: 'Plank', reps: '3 sets × 8 each leg', description: 'Single leg strength' }
      ]
    },
    {
      id: 'beginner-2',
      title: 'Cardio Basics',
      duration: '15 mins',
      calories: '120 cal',
      description: 'Light cardio to build endurance',
      exercises: [
        { id: 1, name: 'Jumping Jacks', reps: '3 sets × 30 seconds', description: 'Full body warm-up' },
        { id: 2, name: 'High Knees', reps: '3 sets × 20 reps', description: 'Cardio movement' },
        { id: 3, name: 'Butt Kicks', reps: '3 sets × 20 reps', description: 'Dynamic warm-up' },
        { id: 4, name: 'Mountain Climbers', reps: '3 sets × 15 reps', description: 'Core and cardio' }
      ]
    }
  ],
  intermediate: [
    {
      id: 'intermediate-1',
      title: 'Upper Body Power',
      duration: '30 mins',
      calories: '250 cal',
      description: 'Build upper body strength and endurance',
      exercises: [
        { id: 1, name: 'Pike Push-ups', reps: '4 sets × 8-12 reps', description: 'Shoulder focused push-up' },
        { id: 2, name: 'Diamond Push-ups', reps: '3 sets × 6-10 reps', description: 'Tricep emphasis' },
        { id: 3, name: 'Burpees', reps: '3 sets × 8-12 reps', description: 'Full body exercise' },
        { id: 4, name: 'Plank to Push-up', reps: '3 sets × 8 reps', description: 'Dynamic core and arms' }
      ]
    }
  ],
  advanced: [
    {
      id: 'advanced-1',
      title: 'Elite Training',
      duration: '45 mins',
      calories: '400 cal',
      description: 'High-intensity training for peak performance',
      exercises: [
        { id: 1, name: 'One-Arm Push-ups', reps: '3 sets × 5 each arm', description: 'Advanced upper body' },
        { id: 2, name: 'Pistol Squats', reps: '3 sets × 8 each leg', description: 'Single leg squat' },
        { id: 3, name: 'Handstand Hold', reps: '3 sets × 30 seconds', description: 'Balance and strength' },
        { id: 4, name: 'Muscle-ups', reps: '3 sets × 5 reps', description: 'Advanced pull exercise' }
      ]
    }
  ]
}

// Level Selection Component
function LevelSelection() {
  const navigate = useNavigate()
  
  const levels = [
    {
      level: 'beginner',
      title: 'Beginner',
      description: 'Perfect for those just starting their fitness journey',
      color: 'green',
      icon: '🌱'
    },
    {
      level: 'intermediate',
      title: 'Intermediate',
      description: 'Ready to challenge yourself with moderate intensity',
      color: 'blue',
      icon: '💪'
    },
    {
      level: 'advanced',
      title: 'Advanced',
      description: 'High-intensity workouts for experienced athletes',
      color: 'violet',
      icon: '🔥'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Level</h1>
        <p className="text-ar-gray text-lg">
          Select your fitness level to get personalized workouts
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {levels.map((level, index) => (
          <motion.div
            key={level.level}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-ar-blue/50 transition-all duration-300 hover:shadow-glow-blue group"
            onClick={() => navigate(`/workout/${level.level}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">
                {level.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-ar-white">
                {level.title}
              </h3>
              <p className="text-ar-gray mb-6">
                {level.description}
              </p>
              <button 
                className={`
                  w-full font-bold py-3 rounded-xl transition-all duration-300
                  bg-white/10 backdrop-blur-sm border border-white/20 text-white
                  hover:bg-white/20 hover:border-white/30 hover:shadow-lg
                  ${level.color === 'green' ? 'hover:shadow-glow-green' : 
                    level.color === 'blue' ? 'hover:shadow-glow-blue' :
                    'hover:shadow-glow-violet'}
                `}
              >
                View Plans
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Plans List Component
function PlansList() {
  const { level } = useParams()
  const navigate = useNavigate()
  const plans = workoutPlans[level] || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => navigate('/workout')}
          className="p-2 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300"
        >
          <ArrowLeft size={24} className="text-ar-blue" />
        </button>
        <div>
          <h1 className="text-4xl font-bold capitalize">{level} Workouts</h1>
          <p className="text-ar-gray">Choose a workout plan to get started</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            className="glass-card p-6 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 text-ar-blue">
                <Clock size={16} />
                <span className="text-sm">{plan.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-ar-violet">
                <Zap size={16} />
                <span className="text-sm">{plan.calories}</span>
              </div>
            </div>
            <p className="text-ar-gray mb-6">{plan.description}</p>
            <button
              onClick={() => navigate(`/workout/${level}/${plan.id}`)}
              className="w-full bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:shadow-glow-blue"
            >
              View Details
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Plan Detail Component
function PlanDetail() {
  const { level, planId } = useParams()
  const navigate = useNavigate()
  const plan = workoutPlans[level]?.find(p => p.id === planId)

  if (!plan) {
    return <div className="text-center text-ar-gray">Plan not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => navigate(`/workout/${level}`)}
          className="p-2 glass-card rounded-xl hover:border-ar-blue/50 transition-all duration-300"
        >
          <ArrowLeft size={24} className="text-ar-blue" />
        </button>
        <div>
          <h1 className="text-4xl font-bold">{plan.title}</h1>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-ar-blue">
              <Clock size={16} />
              <span>{plan.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-ar-violet">
              <Zap size={16} />
              <span>{plan.calories}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass-card p-6 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6">Exercises</h2>
        <div className="space-y-4">
          {plan.exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              className="p-4 bg-ar-dark-gray/30 rounded-xl border border-ar-blue/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-ar-white mb-2">
                    {index + 1}. {exercise.name}
                  </h3>
                  <p className="text-ar-blue font-medium mb-1">
                    {exercise.reps}
                  </p>
                  <p className="text-ar-gray text-sm">
                    {exercise.description}
                  </p>
                </div>
                <div className="w-16 h-16 bg-ar-blue/20 rounded-lg flex items-center justify-center">
                  <Dumbbell className="text-ar-blue" size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={() => navigate(`/workout/${level}/${planId}/session`)}
          className="w-full bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-4 rounded-xl mt-8 transition-all duration-300 hover:shadow-glow-blue text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Play size={20} />
            Begin Workout
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}

// Workout Session Component
function WorkoutSession() {
  const { level, planId } = useParams()
  const navigate = useNavigate()
  const [currentExercise, setCurrentExercise] = useState(0)
  const plan = workoutPlans[level]?.find(p => p.id === planId)

  if (!plan) {
    return <div className="text-center text-ar-gray">Plan not found</div>
  }

  const exercise = plan.exercises[currentExercise]
  const isLastExercise = currentExercise === plan.exercises.length - 1

  const handleNext = () => {
    if (isLastExercise) {
      navigate(`/workout/${level}/${planId}/complete`)
    } else {
      setCurrentExercise(currentExercise + 1)
    }
  }

  const handleAnalyzer = () => {
    navigate(`/workout/${level}/${planId}/session/${exercise.id}/analyzer/${exercise.name}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Bar */}
      <motion.div
        className="glass-card p-4 rounded-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-ar-gray">Progress</span>
          <span className="text-ar-blue font-bold">
            {currentExercise + 1} / {plan.exercises.length}
          </span>
        </div>
        <div className="w-full bg-ar-dark-gray rounded-full h-3">
          <motion.div
            className="bg-ar-blue h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentExercise + 1) / plan.exercises.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Exercise Display */}
      <motion.div
        className="glass-card p-8 rounded-2xl text-center"
        key={currentExercise}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Exercise Animation/GIF Placeholder */}
        <div className="w-48 h-48 mx-auto mb-6 bg-ar-blue/20 rounded-2xl flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Dumbbell className="text-ar-blue" size={64} />
          </motion.div>
        </div>

        <h2 className="text-3xl font-bold mb-4">{exercise.name}</h2>
        <p className="text-ar-blue text-xl font-bold mb-2">{exercise.reps}</p>
        <p className="text-ar-gray mb-8">{exercise.description}</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleNext}
            className="flex-1 max-w-xs bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-glow-blue"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              {isLastExercise ? 'Finish Workout' : 'Exercise Done'}
            </div>
          </button>
          
          <button
            onClick={handleAnalyzer}
            className="flex-1 max-w-xs bg-ar-violet hover:bg-ar-violet/80 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-glow-violet"
          >
            <div className="flex items-center justify-center gap-2">
              <Camera size={20} />
              Form Analyzer
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Form Analyzer Component
function FormAnalyzer() {
  const { level, planId, exerciseId,exerciseName } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [reps, setReps] = useState(0);
  const [pose, setPose] = useState(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const drawingUtilsRef = useRef(null);

  const plan = workoutPlans[level]?.find(p => p.id === planId)
  const exercise = plan?.exercises.find(e => e.id === parseInt(exerciseId))
  const exerciseNames=exerciseName.toLowerCase().replace('-','')
  useEffect(() => {
    initializePoseLandmarker();
    const ws = new WebSocket(`wss://araise-backend-1012835535994.asia-south1.run.app/ws/${exerciseNames}`);
    
    ws.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setReps(data.reps);
      setFeedback(data.feedback);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [])

  // Handle canvas size
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const handleResize = () => {
      const videoEl = videoRef.current;
      const canvasEl = canvasRef.current;
      
      // Set canvas size to match video dimensions
      canvasEl.width = videoEl.offsetWidth;
      canvasEl.height = videoEl.offsetHeight;
    };

    // Set initial size
    handleResize();

    // Update on window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!poseLandmarker || !webcamRunning || !videoRef.current || !canvasRef.current) return;

    let lastVideoTime = -1;
    const canvasCtx = canvasRef.current.getContext('2d');
    const drawingUtils = new DrawingUtils(canvasCtx);

    async function predictWebcam() {
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        const startTimeMs = performance.now();
        
        // Detect poses
        const results = await poseLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        // Clear the canvas
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw the landmarks and connections
        for (const landmark of results.landmarks) {
          drawingUtils.drawLandmarks(landmark, {
            radius: (data) => DrawingUtils.lerp(data.from?.z || 0, -0.15, 0.1, 5, 1)
          });
          drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
        }
        canvasCtx.restore();

        // Send frame data to WebSocket if connected
        if (socket && socket.readyState === WebSocket.OPEN) {
          try {
            // Create a temporary canvas to capture the frame
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = videoRef.current.videoWidth;
            tempCanvas.height = videoRef.current.videoHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw the current video frame
            tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // Convert to base64 and send
            const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1]; // Remove the data URL header
            
            // Ensure the base64 string is properly padded
            const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
            socket.send(paddedBase64);
          } catch (error) {
            console.error('Error sending frame:', error);
          }
        }
      }

      if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
      }
    }

    predictWebcam();

    return () => {
      setWebcamRunning(false);
    };
  }, [poseLandmarker, webcamRunning, socket]);

const initializePoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 2
      });
      
      setPoseLandmarker(poseLandmarker);
      
      // Initialize drawing utils
      const canvasCtx = canvasRef.current.getContext("2d");
      drawingUtilsRef.current = new DrawingUtils(canvasCtx);
      
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setWebcamRunning(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

 const stopCamera = () => {
    // Stop the camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Stop webcam running state
    setWebcamRunning(false);
    
    // Close WebSocket connection if open
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  }    
  const handleBack = () => {
    stopCamera();
    navigate(`/workout/${level}/${planId}/session`)
  }
  
  const handleDone = () => {
    stopCamera()
    navigate(`/workout/${level}/${planId}/session`)
  }

  if (!exercise) {
    return <div className="text-center text-ar-gray-400">Exercise not found</div>
  }
  console.log(reps,feedback)
  return (
    <div className="fixed inset-0 bg-ar-black flex flex-col md:pl-[280px] h-full overflow-hidden">
      {/* Header with mobile responsiveness */}
      <motion.div
        className="flex items-center justify-between p-4 bg-ar-darker/95 backdrop-blur-lg border-b border-ar-gray-800 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-ar-white">Form Analyzer</h1>
          <span className="text-ar-gray-400">{exercise.name}</span>
        </div>
      </motion.div>

      {/* Full Screen Camera with Scrollable Container */}
      <motion.div
        className="flex-1 relative overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Stats Overlay */}
          <div className="absolute top-4 left-4 flex gap-4">
            <div className="bg-ar-black/80 text-ar-white px-4 py-2 rounded-xl border border-ar-blue/50">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-ar-blue" />
                <span className="font-bold">Reps: {reps}</span>
              </div>
            </div>
          </div>

          {/* Feedback Overlay */}
          {feedback && (
            <div className="absolute top-4 right-4">
              <div className="bg-ar-black/80 text-ar-white px-4 py-2 rounded-xl border border-ar-violet/50">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-ar-violet" />
                  <span>{feedback}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Controls */}
      <motion.div
        className="p-6 bg-ar-darker/95 backdrop-blur-lg border-t border-ar-gray-800 mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="bg-ar-gray-700 hover:bg-ar-gray-600 text-ar-white font-bold py-4 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <button
            onClick={handleDone}
            className="bg-ar-blue hover:bg-ar-blue-light text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Workout Complete Component
function WorkoutComplete() {
  const { level, planId } = useParams()
  const navigate = useNavigate()
  const { setWorkoutCompleted } = useUserStore()
  const plan = workoutPlans[level]?.find(p => p.id === planId)

  useEffect(() => {
    // Mark workout as completed
    setWorkoutCompleted({
      planId,
      level,
      duration: plan?.duration,
      calories: plan?.calories,
      exercises: plan?.exercises.length
    })
  }, [setWorkoutCompleted, planId, level, plan])

  if (!plan) {
    return <div className="text-center text-ar-gray">Plan not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <motion.div
        className="glass-card p-8 rounded-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
      >
        {/* Success Animation */}
        <motion.div
          className="text-8xl mb-6"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          🎉
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">Workout Complete!</h1>
        <p className="text-ar-gray text-lg mb-8">
          Great job completing {plan.title}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock size={20} className="text-ar-blue" />
              <span className="font-bold">Duration</span>
            </div>
            <div className="text-2xl font-bold text-ar-blue">
              {plan.duration}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={20} className="text-ar-violet" />
              <span className="font-bold">Calories</span>
            </div>
            <div className="text-2xl font-bold text-ar-violet">
              {plan.calories}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target size={20} className="text-green-400" />
              <span className="font-bold">Exercises</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {plan.exercises.length}
            </div>
          </div>
        </div>

        {/* Achievement */}
        <motion.div
          className="bg-ar-violet/20 border border-ar-violet/50 rounded-xl p-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame size={24} className="text-ar-violet" />
            <span className="font-bold text-ar-violet">Streak Updated!</span>
          </div>
          <p className="text-ar-gray text-sm">
            Keep going to maintain your fitness streak
          </p>
        </motion.div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-ar-blue hover:bg-ar-blue/80 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-glow-blue text-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy size={20} />
            Back to Dashboard
          </div>
        </button>
      </motion.div>
    </div>
  )
}

// Main Workout Component
export default function Workout() {
  return (
    <Routes>
      <Route path="/" element={<LevelSelection />} />
      <Route path="/:level" element={<PlansList />} />
      <Route path="/:level/:planId" element={<PlanDetail />} />
      <Route path="/:level/:planId/session" element={<WorkoutSession />} />
      <Route path="/:level/:planId/session/:exerciseId/analyzer/:exerciseName" element={<FormAnalyzer />} />
      <Route path="/:level/:planId/complete" element={<WorkoutComplete />} />
    </Routes>
  )
}
