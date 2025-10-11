# Voice Features Implementation Guide

## Overview
The mental health chat now includes comprehensive voice interaction features, allowing users to have natural conversations with Nivi using both speech input and text-to-speech output.

## Features

### 1. Text-to-Speech (TTS) for AI Responses

#### Auto-Speak Mode
- **Toggle Button**: Located in the chat header (speaker icon)
- **Functionality**: When enabled, AI responses are automatically read aloud
- **Icon States**:
  - 🔊 `Volume2` icon = Auto-speak enabled (blue highlight)
  - 🔇 `VolumeX` icon = Auto-speak disabled (gray)

#### Manual Message Playback
- **Speaker Button**: Each AI message has a small speaker icon
- **Functionality**: Click to listen to any specific message
- **Use Case**: Re-listen to previous advice without re-asking

#### Voice Properties
The TTS is configured for a warm, empathetic experience:
- **Rate**: 0.95 (slightly slower for better comprehension)
- **Pitch**: 1.1 (slightly higher for warmth)
- **Volume**: 1.0 (full volume)
- **Voice Selection**: Attempts to use female voices like:
  - Google UK English Female
  - Microsoft Zira
  - Samantha (macOS)
  - Other "Female" labeled voices

### 2. Voice Modal (Full Voice Mode)

#### Activation
- Click the microphone button at the bottom of the chat
- Opens immersive full-screen voice interface

#### Features
- **Visual Feedback**: Beautiful animated orb that responds to audio levels
- **Speech Recognition**: Continuous listening with real-time transcription
- **Audio Visualization**: The orb pulses and animates based on your voice
- **Hands-Free**: Speak naturally without typing

#### Voice Modal Interface
- **Orb Animation**: 
  - Idle: Gentle pulsing
  - Listening: Moderate animation
  - Speaking (user): Responsive to audio levels
  - Speaking (AI): Smooth animations
- **Status Display**: Shows current state (Listening, Speaking, etc.)
- **Done/Start Button**: 
  - Shows "Start" when idle - click to begin listening
  - Shows "Done" when listening - click to stop and send message
  - Blue highlight when listening
  - Automatically sends message when clicked during listening
- **Close Button**: X button at the bottom to exit voice mode

### 3. Speaking State Indicators

#### Header Status
- Shows "Speaking..." when AI is currently reading a response
- Includes animated dot indicator
- Returns to "Always here to listen" when idle

#### Visual Feedback
- Speaking state visible in chat header
- Button states show active/inactive status
- Smooth transitions between states

## User Flow

### Text Mode with Auto-Speak
```
1. User enables auto-speak (speaker button in header)
2. User types message and sends
3. AI responds with text
4. Response is automatically read aloud
5. User can stop audio anytime
```

### Manual Playback
```
1. User browses previous messages
2. Clicks speaker icon on any AI message
3. Message is read aloud
4. Can click on different messages to hear them
```

### Voice Modal Mode
```
1. User clicks microphone button
2. Voice modal opens in full screen
3. Click "Start" button to begin listening (or tap orb)
4. User speaks naturally
5. Speech is transcribed in real-time
6. Click "Done" button when finished speaking
7. Message is automatically sent
8. AI responds (text + voice in modal)
9. Click "Start" again to continue or "X" to exit
```

**Control Options:**
- **Orb Tap**: Toggle listening on/off
- **Start Button**: Begin listening for voice input (gray button)
- **Done Button**: Stop listening and send message (blue button)
- **Close Button (X)**: Exit voice modal

## Technical Implementation

### Speech Synthesis (TTS)
```javascript
const speakText = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  utterance.pitch = 1.1
  utterance.volume = 1.0
  
  // Voice selection
  const voices = speechSynthesis.getVoices()
  const femaleVoice = voices.find(v => v.name.includes('Female'))
  if (femaleVoice) utterance.voice = femaleVoice
  
  // State management
  utterance.onstart = () => setIsSpeaking(true)
  utterance.onend = () => setIsSpeaking(false)
  
  speechSynthesis.speak(utterance)
}
```

### Speech Recognition (Voice Modal)
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'en-US'

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('')
  setCurrentMessage(transcript)
}
```

### Audio Visualization
```javascript
const audioContext = new AudioContext()
const analyser = audioContext.createAnalyser()
const microphone = audioContext.createMediaStreamSource(stream)

analyser.fftSize = 256
microphone.connect(analyser)

// Continuous audio level monitoring
const dataArray = new Uint8Array(analyser.frequencyBinCount)
analyser.getByteFrequencyData(dataArray)
const level = dataArray.reduce((a, b) => a + b) / dataArray.length / 255
```

## Browser Compatibility

### Web Speech API Support
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ⚠️ Firefox (limited support)
- ❌ IE (not supported)

### Required Permissions
- **Microphone**: Required for voice input
- **Network**: Speech recognition requires internet connection

### Fallback Behavior
- If speech recognition unavailable: Shows alert, modal doesn't open
- If TTS unavailable: Buttons are hidden/disabled
- If microphone denied: Shows permission error, closes modal

## Best Practices

### For Users
1. **Enable auto-speak** for hands-free experience
2. **Use voice modal** for private, natural conversations
3. **Click speaker icons** to re-listen to important advice
4. **Disable auto-speak** in public places

### For Developers
1. **Always check browser support** before using APIs
2. **Handle permissions gracefully** with clear error messages
3. **Cleanup resources** (stop recognition, cancel speech) on unmount
4. **Provide visual feedback** for all voice states
5. **Test across browsers** for compatibility

## Accessibility Features

- **Visual indicators** for speaking state
- **Toggle controls** for auto-speak
- **Manual playback** option for each message
- **Keyboard accessible** controls
- **Screen reader friendly** (button labels and titles)

## Privacy & Security

- **No recording**: Speech is processed in real-time, not stored
- **Browser APIs**: All processing done by browser's native APIs
- **No data sent**: Voice processing is local to the browser
- **User control**: Easy to disable/enable at any time

## Future Enhancements

Potential improvements:
1. Voice selection dropdown (choose from available voices)
2. Speed control slider for TTS
3. Volume control
4. Accent/language selection
5. Voice activity detection (auto-stop when user finishes)
6. Background noise suppression settings
7. Save voice preferences
8. Multi-language support
9. Offline TTS support
10. Voice command shortcuts

## Troubleshooting

### Common Issues

**Problem**: Auto-speak not working
- **Solution**: Check if browser supports Web Speech API, ensure volume is up

**Problem**: Voice modal microphone not activating
- **Solution**: Check microphone permissions in browser settings

**Problem**: Voice recognition stops unexpectedly
- **Solution**: Check internet connection, speech recognition requires network

**Problem**: No female voice available
- **Solution**: Fallback to default voice, behavior is browser-dependent

**Problem**: Audio cutting off
- **Solution**: Check for conflicts with other audio applications

## Code Examples

### Enable Auto-Speak Programmatically
```javascript
setAutoSpeak(true)
```

### Speak a Message Manually
```javascript
speakText("Hello, this is Nivi speaking")
```

### Stop Current Speech
```javascript
stopSpeaking()
```

### Check if Speaking
```javascript
if (isSpeaking) {
  // AI is currently speaking
}
```

## Testing Checklist

- [ ] Auto-speak toggle works
- [ ] Speaker button appears on AI messages
- [ ] Voice modal opens/closes properly
- [ ] Speech recognition captures voice accurately
- [ ] TTS uses appropriate voice
- [ ] Speaking state indicator updates correctly
- [ ] Audio stops when navigating away
- [ ] Error handling for denied permissions
- [ ] Works across different browsers
- [ ] Cleanup on component unmount

## Performance Considerations

- **Speech Synthesis**: Lightweight, minimal CPU usage
- **Speech Recognition**: Moderate CPU, requires network
- **Audio Visualization**: Continuous animation loop (60fps target)
- **Memory**: Proper cleanup prevents memory leaks

## API References

- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [SpeechSynthesis - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [SpeechRecognition - MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
