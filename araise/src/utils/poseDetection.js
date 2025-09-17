import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

// MediaPipe pose landmark indices
export const POSE_LANDMARKS = {
  RIGHT_SHOULDER: 12,
  RIGHT_ELBOW: 14,
  RIGHT_WRIST: 16,
  RIGHT_HIP: 24,
  RIGHT_KNEE: 26,
  RIGHT_ANKLE: 28,
  LEFT_SHOULDER: 11,
  LEFT_ELBOW: 13,
  LEFT_WRIST: 15,
  LEFT_HIP: 23,
  LEFT_KNEE: 25,
  LEFT_ANKLE: 27
};

// Exercise coordinate mapping
export const EXERCISE_COORDINATES = {
  'biceps': {
    description: "Bicep curl requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'squats': {
    description: "Squat requires hip, knee, and ankle coordinates",
    landmarks: ['right_hip', 'right_knee', 'right_ankle'],
    indices: [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
  },
  'pushups': {
    description: "Pushup requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'push-ups': {
    description: "Pushup requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'plank': {
    description: "Plank requires shoulder, hip, and knee coordinates",
    landmarks: ['right_shoulder', 'right_hip', 'right_knee'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE]
  },
  'benchpress': {
    description: "Bench press requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'incline-dumbbell-press': {
    description: "Incline dumbbell press requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'incline-barbell-bench-press': {
    description: "Incline barbell bench press requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'flat-barbell-bench-press': {
    description: "Flat barbell bench press requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'close-grip-bench-press': {
    description: "Close-grip bench press requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'ropepulldown': {
    description: "Rope pulldowns require shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'rope-pulldowns': {
    description: "Rope pulldowns require shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'benttricep': {
    description: "Bent tricep pull requires shoulder, elbow, and wrist coordinates",
    landmarks: ['right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'crunches': {
    description: "Crunches require knee, hip, and shoulder coordinates",
    landmarks: ['right_knee', 'right_hip', 'right_shoulder'],
    indices: [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER]
  },
  'pullup': {
    description: "Pull-up requires shoulder, elbow, and wrist coordinates for both sides",
    landmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'chestsupportedrow': {
    description: "Chest supported row requires shoulder, elbow, and wrist coordinates for both sides",
    landmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'widegrippulldown': {
    description: "Wide grip pulldown requires shoulder, elbow, and wrist coordinates for both sides",
    landmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'legpress': {
    description: "Leg press requires hip, knee, and ankle coordinates for both sides",
    landmarks: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
    indices: [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE]
  },
  'chestsupportedshoulderpress': {
    description: "Chest supported shoulder press requires shoulder, elbow, and wrist coordinates for both sides",
    landmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  },
  'overheadshoulderpress': {
    description: "Overhead shoulder press requires shoulder, elbow, and wrist coordinates for both sides",
    landmarks: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
    indices: [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
  }
};

class PoseDetectionService {
  constructor() {
    this.poseLandmarker = null;
    this.isInitialized = false;
    this.drawingUtils = null;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.drawingUtils = new DrawingUtils();
      this.isInitialized = true;
      console.log("Pose detection initialized successfully");
    } catch (error) {
      console.error("Failed to initialize pose detection:", error);
      throw error;
    }
  }

  async detectPose(videoElement, timestamp) {
    if (!this.isInitialized || !this.poseLandmarker) {
      throw new Error("Pose detection not initialized");
    }

    try {
      const results = await this.poseLandmarker.detectForVideo(videoElement, timestamp);
      return results;
    } catch (error) {
      console.error("Pose detection failed:", error);
      return null;
    }
  }

  extractCoordinatesForExercise(landmarks, exerciseName, canvasWidth, canvasHeight) {
    console.log('🔍 extractCoordinatesForExercise called with:', {
      landmarksCount: landmarks?.length,
      exerciseName,
      canvasSize: [canvasWidth, canvasHeight]
    });
    
    if (!landmarks || landmarks.length === 0) {
      console.warn('❌ No landmarks provided');
      return null;
    }

    const exerciseKey = exerciseName.toLowerCase().replace(/\s+/g, '-');
    const exerciseConfig = EXERCISE_COORDINATES[exerciseKey];
    
    console.log('🎯 Exercise key:', exerciseKey);
    console.log('⚙️ Exercise config:', exerciseConfig);
    
    if (!exerciseConfig) {
      console.warn(`❌ No coordinate configuration found for exercise: ${exerciseName}`);
      return null;
    }

    const coordinates = {};
    const poseLandmarks = landmarks[0]; // Get first (and only) pose
    
    console.log('👤 Pose landmarks count:', poseLandmarks?.length);

    exerciseConfig.landmarks.forEach((landmarkName, index) => {
      const landmarkIndex = exerciseConfig.indices[index];
      console.log(`🎯 Processing ${landmarkName} at index ${landmarkIndex}`);
      
      if (poseLandmarks[landmarkIndex]) {
        const landmark = poseLandmarks[landmarkIndex];
        console.log(`📍 Landmark ${landmarkName}:`, {
          x: landmark.x,
          y: landmark.y,
          visibility: landmark.visibility
        });
        
        // Convert normalized coordinates to pixel coordinates
        coordinates[landmarkName] = [
          Math.round(landmark.x * canvasWidth),
          Math.round(landmark.y * canvasHeight)
        ];
      } else {
        console.warn(`❌ Landmark ${landmarkName} not found at index ${landmarkIndex}`);
      }
    });

    const result = {
      exercise: exerciseKey,
      coordinates: coordinates,
      timestamp: Date.now()
    };
    
    console.log('✅ Final coordinates result:', result);
    return result;
  }

  drawPose(canvasCtx, landmarks, connections, canvasWidth, canvasHeight) {
    if (!this.drawingUtils || !landmarks || landmarks.length === 0) return;

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw pose landmarks and connections
    for (const landmark of landmarks) {
      this.drawingUtils.drawLandmarks(canvasCtx, landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
      });

      this.drawingUtils.drawConnectors(canvasCtx, landmark, connections, {
        color: '#00FF00',
        lineWidth: 2
      });
    }
  }

  isValidPose(landmarks, exerciseName) {
    if (!landmarks || landmarks.length === 0) return false;

    const exerciseKey = exerciseName.toLowerCase().replace(/\s+/g, '-');
    const exerciseConfig = EXERCISE_COORDINATES[exerciseKey];
    
    if (!exerciseConfig) return false;

    const poseLandmarks = landmarks[0];
    
    // Check if all required landmarks are visible with good confidence
    return exerciseConfig.indices.every(index => {
      const landmark = poseLandmarks[index];
      return landmark && landmark.visibility > 0.5;
    });
  }
}

export const poseDetectionService = new PoseDetectionService();
