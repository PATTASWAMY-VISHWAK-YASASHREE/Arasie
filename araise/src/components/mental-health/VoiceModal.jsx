import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff } from "lucide-react"

export default function VoiceModal({
    isOpen,
    onClose,
    onMessageSend,
    currentMessage,
    setCurrentMessage
}) {
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [audioLevel, setAudioLevel] = useState(0)

    const recognitionRef = useRef(null)
    const synthRef = useRef(null)
    const audioContextRef = useRef(null)
    const analyserRef = useRef(null)
    const microphoneRef = useRef(null)

    // Initialize speech recognition and synthesis
    useEffect(() => {
        // Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true
            recognitionRef.current.lang = 'en-US'

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('')

                setCurrentMessage(transcript)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
                if (currentMessage.trim()) {
                    onMessageSend(currentMessage)
                }
            }

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)

                // Handle different error types
                let errorMessage = 'Voice recognition error occurred.'
                switch (event.error) {
                    case 'network':
                        errorMessage = 'Network error. Please check your internet connection and try again.'
                        break
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please allow microphone permissions.'
                        break
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try speaking again.'
                        break
                    case 'audio-capture':
                        errorMessage = 'Microphone not found. Please check your audio device.'
                        break
                    default:
                        errorMessage = `Voice recognition error: ${event.error}`
                }

                // Show error message to user
                alert(errorMessage)
                onClose()
            }
        }

        // Speech Synthesis
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            if (synthRef.current) {
                synthRef.current.cancel()
            }
        }
    }, [])

    // Start listening when modal opens
    useEffect(() => {
        if (isOpen && recognitionRef.current) {
            startListening()
        }

        return () => {
            // Cleanup when modal closes
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            if (synthRef.current) {
                synthRef.current.cancel()
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
            setIsListening(false)
            setIsSpeaking(false)
        }
    }, [isOpen])

    // Audio visualization setup
    const setupAudioVisualization = async () => {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('getUserMedia not supported, skipping audio visualization')
                return
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
            analyserRef.current = audioContextRef.current.createAnalyser()
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)

            analyserRef.current.fftSize = 256
            analyserRef.current.smoothingTimeConstant = 0.8
            microphoneRef.current.connect(analyserRef.current)

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

            const updateAudioLevel = () => {
                if (isListening && analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray)
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
                    setAudioLevel(Math.min(average / 255, 1))
                    requestAnimationFrame(updateAudioLevel)
                }
            }

            updateAudioLevel()
        } catch (error) {
            console.error('Error accessing microphone:', error)

            // Handle specific microphone errors
            if (error.name === 'NotAllowedError') {
                alert('Microphone access denied. Please allow microphone permissions and try again.')
            } else if (error.name === 'NotFoundError') {
                alert('No microphone found. Please connect a microphone and try again.')
            } else {
                console.warn('Microphone access failed, continuing without audio visualization')
            }
        }
    }

    // Text-to-speech function
    const speakText = (text) => {
        if (!synthRef.current || !text) return

        try {
            // Cancel any ongoing speech
            synthRef.current.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.9
            utterance.pitch = 1
            utterance.volume = 0.8

            // Wait for voices to load if they haven't already
            const setVoiceAndSpeak = () => {
                const voices = synthRef.current.getVoices()

                // Find a suitable voice (prefer female voices)
                const preferredVoice = voices.find(voice =>
                    voice.name.toLowerCase().includes('female') ||
                    voice.name.toLowerCase().includes('samantha') ||
                    voice.name.toLowerCase().includes('karen') ||
                    voice.name.toLowerCase().includes('zira') ||
                    voice.gender === 'female'
                ) || voices.find(voice => voice.lang.startsWith('en'))

                if (preferredVoice) {
                    utterance.voice = preferredVoice
                }

                utterance.onstart = () => setIsSpeaking(true)
                utterance.onend = () => setIsSpeaking(false)
                utterance.onerror = (event) => {
                    // Only log non-interrupted errors (interrupted is normal when canceling speech)
                    if (event.error !== 'interrupted') {
                        console.error('Speech synthesis error:', event.error)
                    }
                    setIsSpeaking(false)
                }

                synthRef.current.speak(utterance)
            }

            // Check if voices are already loaded
            if (synthRef.current.getVoices().length > 0) {
                setVoiceAndSpeak()
            } else {
                // Wait for voices to load
                synthRef.current.onvoiceschanged = setVoiceAndSpeak
            }
        } catch (error) {
            console.error('Error in text-to-speech:', error)
            setIsSpeaking(false)
        }
    }

    const startListening = async () => {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
            return
        }

        // Check internet connection
        if (!navigator.onLine) {
            alert('Voice chat requires an internet connection. Please check your connection and try again.')
            return
        }

        try {
            setIsListening(true)
            await setupAudioVisualization()

            // Add a small delay before starting recognition
            setTimeout(() => {
                if (recognitionRef.current) {
                    recognitionRef.current.start()
                }
            }, 500)
        } catch (error) {
            console.error('Error starting voice mode:', error)
            alert('Failed to start voice chat. Please try again.')
            setIsListening(false)
            onClose()
        }
    }

    // Expose speakText function to parent
    useEffect(() => {
        if (isOpen) {
            window.voiceModalSpeakText = speakText
        }
        return () => {
            if (window.voiceModalSpeakText) {
                delete window.voiceModalSpeakText
            }
        }
    }, [isOpen, speakText])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-ar-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
                    >
                        {/* Voice Visualization */}
                        <div className="relative mb-8">
                            {/* Main Circle */}
                            <motion.div
                                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-ar-blue to-ar-blue-light flex items-center justify-center relative overflow-hidden"
                                animate={{
                                    scale: isListening ? [1, 1.1, 1] : isSpeaking ? [1, 1.05, 1] : 1,
                                }}
                                transition={{
                                    duration: isListening ? 1.5 : isSpeaking ? 2 : 0.3,
                                    repeat: (isListening || isSpeaking) ? Infinity : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                {/* Animated Background */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                                    animate={{
                                        rotate: isListening || isSpeaking ? 360 : 0,
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: (isListening || isSpeaking) ? Infinity : 0,
                                        ease: "linear"
                                    }}
                                />

                                {/* Sound Waves */}
                                {(isListening || isSpeaking) && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {[...Array(4)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1 bg-white rounded-full"
                                                style={{
                                                    height: `${20 + i * 8}px`,
                                                    left: `${40 + i * 8}px`,
                                                }}
                                                animate={{
                                                    scaleY: isListening
                                                        ? [1, 1.5 + audioLevel * 2, 1]
                                                        : [1, 1.2, 0.8, 1.2, 1],
                                                }}
                                                transition={{
                                                    duration: 0.5 + i * 0.1,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Microphone Icon */}
                                <Mic size={32} className="text-white relative z-10" />
                            </motion.div>

                            {/* Outer Rings */}
                            {(isListening || isSpeaking) && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-2 border-ar-blue/30"
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.3, 0, 0.3],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeOut"
                                        }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-2 border-ar-blue/20"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.2, 0, 0.2],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeOut",
                                            delay: 0.5
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        {/* Status Text */}
                        <motion.div
                            key={isListening ? 'listening' : isSpeaking ? 'speaking' : 'ready'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6"
                        >
                            <h3 className="text-xl font-poppins font-semibold text-ar-white mb-2">
                                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Voice Chat'}
                            </h3>
                            <p className="text-ar-gray-400 text-sm">
                                {isListening
                                    ? 'Speak now, I\'m listening to you'
                                    : isSpeaking
                                        ? 'Nivi is responding to you'
                                        : 'Voice chat ready - speak naturally'
                                }
                            </p>

                            {/* Connection Status */}
                            {!navigator.onLine && (
                                <p className="text-red-400 text-xs mt-2">
                                    ⚠️ No internet connection - voice features may not work
                                </p>
                            )}
                        </motion.div>

                        {/* Current Message Display */}
                        {currentMessage && isListening && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-ar-gray-800 rounded-xl p-3 mb-6"
                            >
                                <p className="text-ar-white text-sm">{currentMessage}</p>
                            </motion.div>
                        )}

                        {/* Control Buttons */}
                        <div className="flex justify-center gap-4">
                            <motion.button
                                onClick={onClose}
                                className="w-12 h-12 bg-ar-gray-800 hover:bg-ar-gray-700 rounded-full flex items-center justify-center text-ar-gray-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                ×
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}