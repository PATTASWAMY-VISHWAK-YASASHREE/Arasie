class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.currentExercise = null;
    this.callbacks = {
      onConnect: [],
      onDisconnect: [],
      onMessage: [],
      onError: []
    };
  }

  connect(exercise = null, baseUrl = null) {
    // Determine base WebSocket URL
    const defaultBaseUrl = import.meta.env.VITE_WS_BASE_URL;
    const wsBaseUrl = 'ws://127.0.0.1:8000'
    
    // Build complete WebSocket URL with exercise path parameter
    let wsUrl;
    if (exercise) {
      // Normalize exercise name (lowercase, spaces to hyphens)
      const normalizedExercise = exercise.toLowerCase().replace(/\s+/g, '-');
      wsUrl = `wss://araise-backend-code.onrender.com/ws/${normalizedExercise}`;
      this.currentExercise = normalizedExercise;
      console.log('🔗 Connecting to WebSocket URL:', wsUrl);
      console.log('🏃 Exercise:', exercise, '→', normalizedExercise);
    } else {
      // Fallback to generic endpoint
      wsUrl = `${wsBaseUrl}/ws`;
      this.currentExercise = null;
      console.log('🔗 Connecting to generic WebSocket URL:', wsUrl);
    }

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to:', wsUrl);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.callbacks.onConnect.forEach(callback => callback());
      };

      this.ws.onmessage = (event) => {
        console.log('🔵 Raw WebSocket message received:', event);
        console.log('🔵 Message data type:', typeof event.data);
        console.log('🔵 Message data content:', event.data);
        
        try {
          const data = JSON.parse(event.data);
          console.log('🟢 Parsed WebSocket data:', data);
          console.log('🟢 Callbacks count:', this.callbacks.onMessage.length);
          this.callbacks.onMessage.forEach((callback, index) => {
            console.log(`📞 Calling onMessage callback ${index} with:`, data);
            callback(data);
          });
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          console.error('❌ Raw message that failed to parse:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.callbacks.onDisconnect.forEach(callback => callback());
        this.handleReconnect(exercise, baseUrl);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.callbacks.onError.forEach(callback => callback(error));
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.callbacks.onError.forEach(callback => callback(error));
    }
  }

  handleReconnect(exercise, baseUrl) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(exercise, baseUrl);
      }, this.reconnectInterval);
    } else {
      console.log('Max reconnect attempts reached');
    }
  }

  sendCoordinates(exerciseData) {
    console.log('📡 sendCoordinates called with:', exerciseData);
    console.log('🔗 WebSocket status:', {
      isConnected: this.isConnected,
      hasWs: !!this.ws,
      readyState: this.ws?.readyState
    });
    
    if (!this.isConnected || !this.ws) {
      console.warn('❌ WebSocket not connected, cannot send coordinates');
      return false;
    }

    try {
      // Send data directly without wrapping - backend expects raw coordinate data
      const message = JSON.stringify(exerciseData);
      
      console.log('📤 Sending raw coordinates:', exerciseData);
      console.log('📄 JSON message:', message);
      this.ws.send(message);
      console.log('✅ Coordinates sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending coordinates:', error);
      return false;
    }
  }

  sendWorkoutStart(exerciseName, planId, level) {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected');
      return false;
    }

    try {
      const message = JSON.stringify({
        type: 'workout_start',
        data: {
          exercise: exerciseName,
          planId: planId,
          level: level,
          timestamp: Date.now()
        }
      });
      
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('Error sending workout start:', error);
      return false;
    }
  }

  sendWorkoutEnd(exerciseName) {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected');
      return false;
    }

    try {
      const message = JSON.stringify({
        type: 'workout_end',
        data: {
          exercise: exerciseName,
          timestamp: Date.now()
        }
      });
      
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('Error sending workout end:', error);
      return false;
    }
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.currentExercise = null;
    }
  }

  // Helper method to connect to a specific exercise endpoint
  connectToExercise(exerciseName, baseUrl = null) {
    console.log(`Connecting to exercise endpoint: ${exerciseName}`);
    this.connect(exerciseName, baseUrl);
  }

  // Helper method to switch exercises (disconnect and reconnect)
  switchExercise(newExerciseName, baseUrl = null) {
    console.log(`Switching from ${this.currentExercise} to ${newExerciseName}`);
    this.disconnect();
    setTimeout(() => {
      this.connectToExercise(newExerciseName, baseUrl);
    }, 100);
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      currentExercise: this.currentExercise
    };
  }
}

export const webSocketService = new WebSocketService();
