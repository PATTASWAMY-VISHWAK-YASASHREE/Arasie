// Text-to-Speech Service for voice feedback
class TextToSpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isMuted = false;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 0.8;
    this.preferredVoice = null;
    
    // Event listeners
    this.onSpeakStart = null;
    this.onSpeakEnd = null;
    this.onSpeakError = null;
    
    this.initializeVoices();
  }

  // Initialize and select preferred voice
  initializeVoices() {
    const setVoice = () => {
      const voices = this.synthesis.getVoices();
      
      // Prefer female voices for fitness coaching
      const preferredVoices = [
        'Google UK English Female',
        'Microsoft Zira Desktop',
        'Alex',
        'Samantha',
        'Karen',
        'Tessa'
      ];

      // Find the first available preferred voice
      for (const voiceName of preferredVoices) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          this.preferredVoice = voice;
          break;
        }
      }

      // Fallback to any English female voice
      if (!this.preferredVoice) {
        this.preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
        );
      }

      // Final fallback to first English voice
      if (!this.preferredVoice) {
        this.preferredVoice = voices.find(v => v.lang.startsWith('en'));
      }

      console.log('Selected voice:', this.preferredVoice?.name);
    };

    // Set voice immediately if available
    setVoice();

    // Some browsers load voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = setVoice;
    }
  }

  // Speak the given text
  speak(text, options = {}) {
    // Don't speak if muted or if synthesis is not available
    if (this.isMuted || !this.synthesis || !text || text.trim() === '') {
      return Promise.resolve();
    }

    // Stop any current speech
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        
        // Set voice properties
        utterance.voice = this.preferredVoice;
        utterance.rate = options.rate || this.rate;
        utterance.pitch = options.pitch || this.pitch;
        utterance.volume = options.volume || this.volume;

        // Event handlers
        utterance.onstart = () => {
          console.log('🔊 Started speaking:', text);
          this.isSpeaking = true;
          this.currentUtterance = utterance;
          if (this.onSpeakStart) this.onSpeakStart();
        };

        utterance.onend = () => {
          console.log('🔇 Finished speaking:', text);
          this.isSpeaking = false;
          this.currentUtterance = null;
          if (this.onSpeakEnd) this.onSpeakEnd();
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('🚨 Speech error:', event.error);
          this.isSpeaking = false;
          this.currentUtterance = null;
          if (this.onSpeakError) this.onSpeakError(event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Start speaking
        this.synthesis.speak(utterance);
        
      } catch (error) {
        console.error('🚨 TTS Service error:', error);
        this.isSpeaking = false;
        this.currentUtterance = null;
        reject(error);
      }
    });
  }

  // Stop current speech
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isSpeaking) {
      this.stop();
    }
    console.log('🔊 Voice', this.isMuted ? 'muted' : 'unmuted');
    return this.isMuted;
  }

  // Set voice settings
  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(2.0, rate));
  }

  setPitch(pitch) {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Get current state
  getState() {
    return {
      isSpeaking: this.isSpeaking,
      isMuted: this.isMuted,
      isAvailable: !!this.synthesis,
      currentVoice: this.preferredVoice?.name || 'Default',
      rate: this.rate,
      pitch: this.pitch,
      volume: this.volume
    };
  }

  // Set event listeners
  setEventListeners({ onSpeakStart, onSpeakEnd, onSpeakError }) {
    this.onSpeakStart = onSpeakStart;
    this.onSpeakEnd = onSpeakEnd;
    this.onSpeakError = onSpeakError;
  }

  // Utility method to speak feedback with appropriate tone
  speakFeedback(feedbackText, type = 'neutral') {
    if (!feedbackText) return;

    // Adjust speech parameters based on feedback type
    const speechOptions = {
      encouraging: { rate: 0.9, pitch: 1.2, volume: 0.9 },
      warning: { rate: 1.0, pitch: 0.9, volume: 1.0 },
      correction: { rate: 0.8, pitch: 1.0, volume: 0.9 },
      completion: { rate: 0.9, pitch: 1.3, volume: 1.0 },
      neutral: { rate: 1.0, pitch: 1.0, volume: 0.8 }
    };

    const options = speechOptions[type] || speechOptions.neutral;
    
    // Clean up text for better speech
    const cleanText = feedbackText
      .replace(/[\u{1F3AF}\u{1F525}\u{1F4AA}\u{2B50}\u{2705}\u{274C}\u{1F3C3}\u{1F44D}]/gu, '') // Remove emojis
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return this.speak(cleanText, options);
  }

  // Check if speech synthesis is supported
  static isSupported() {
    return 'speechSynthesis' in window;
  }
}

// Create singleton instance
export const textToSpeechService = new TextToSpeechService();

export default TextToSpeechService;