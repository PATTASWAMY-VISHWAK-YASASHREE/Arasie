# Continuous Voice Conversation Flow

## Overview
The voice modal now supports a seamless, continuous conversation flow where the AI automatically listens after responding, creating a natural back-and-forth dialogue.

## Conversation Cycle

### Complete Flow Diagram
```
┌─────────────────────────────────────────────────────────┐
│                   VOICE MODAL OPENS                      │
│                   Click "Start" Button                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              STATE 1: LISTENING                          │
│  • Orb animates with audio levels                       │
│  • User speaks their message                            │
│  • Transcript shown in real-time                        │
│  • Button shows "Done" (blue)                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ User clicks "Done"
                  ▼
┌─────────────────────────────────────────────────────────┐
│         STATE 2: THINKING (Waiting for API)             │
│  • Orb shows idle animation                             │
│  • "Thinking..." status                                 │
│  • Button shows "Thinking..." with spinner              │
│  • Message sent to API                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ API responds
                  ▼
┌─────────────────────────────────────────────────────────┐
│              STATE 3: SPEAKING                           │
│  • AI response is spoken aloud                          │
│  • Orb shows speaking animation                         │
│  • "Speaking..." status                                 │
│  • Button shows "Speaking" (disabled)                   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Speech finishes
                  │ (Auto-transition after 500ms)
                  ▼
┌─────────────────────────────────────────────────────────┐
│         STATE 1: LISTENING (Auto-restart)                │
│  • Automatically starts listening again                  │
│  • Ready for next user input                            │
│  • Continuous conversation continues                     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ Loop continues until user closes modal
                  ▼
                [User clicks X to close]
```

## State Transitions

### 1. Listening → Thinking
**Trigger**: User clicks "Done" button
**Actions**:
- Stop speech recognition
- Send message to API via `onMessageSend()`
- Clear current message
- Set `isWaitingForResponse = true`
- Update button to show "Thinking..."

### 2. Thinking → Speaking
**Trigger**: API response received
**Actions**:
- Store response in `pendingResponse`
- Wait for safe state (not listening, not already speaking)
- Start text-to-speech with response
- Set `isSpeaking = true`
- Update button to show "Speaking"

### 3. Speaking → Listening
**Trigger**: TTS utterance ends
**Actions**:
- Wait 500ms delay
- Automatically call `startListening()`
- Reset to listening state
- Update button to show "Done"
- **Cycle continues automatically**

## Button States

| State | Button Text | Icon | Color | Clickable | Action |
|-------|-------------|------|-------|-----------|--------|
| Listening | "Done" | ✓ | Blue | Yes | Stop & send |
| Thinking | "Thinking..." | ⟳ | Gray | No | Disabled |
| Speaking | "Speaking" | 🔊 | Gray | No | Disabled |
| Idle | "Start" | 🎤 | Gray | Yes | Begin listening |

## Visual Indicators

### Header Status Text
- **Listening**: "Listening..."
- **Thinking**: "Thinking..."
- **Speaking**: "Speaking..."
- **Idle**: "Voice Chat"

### Subtitle Text
- **Listening**: "Speak now, I'm listening to you"
- **Thinking**: "Processing your message..."
- **Speaking**: "Nivi is responding to you"
- **Idle**: "Click Start or tap the orb to speak with Nivi"

### Orb Animation
- **Listening**: Responds to audio levels (active pulsing)
- **Thinking**: Gentle idle animation
- **Speaking**: Smooth speaking animation
- **Idle**: Subtle breathing animation

## User Experience Flow

### Typical Conversation
```
User: Opens voice modal
System: Shows "Start" button

User: Clicks "Start"
System: Begins listening, shows "Done" button

User: Speaks "I'm feeling stressed today"
System: Displays transcript in real-time

User: Clicks "Done"
System: Shows "Thinking..." with spinner

System: Receives API response
System: Begins speaking response
System: Shows "Speaking" status

System: Finishes speaking
System: Waits 500ms
System: Automatically starts listening again
System: Shows "Done" button ready

User: Speaks next message
... cycle continues ...

User: Clicks X to close
System: Stops all processes, closes modal
```

## Implementation Details

### Key State Variables
```javascript
const [isListening, setIsListening] = useState(false)
const [isSpeaking, setIsSpeaking] = useState(false)
const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
const [pendingResponse, setPendingResponse] = useState(null)
```

### Auto-Listen After Speaking
```javascript
utterance.onend = () => {
    setIsSpeaking(false)
    // Auto-restart listening after AI finishes speaking
    setTimeout(() => {
        if (isOpen) {
            startListening()
        }
    }, 500)
}
```

### Response Handling
```javascript
// When API response comes in through voiceModalSpeakText
window.voiceModalSpeakText = (text) => {
    setPendingResponse(text)
}

// Effect watches for pending response
useEffect(() => {
    if (pendingResponse && isOpen && !isListening && !isSpeaking) {
        speakText(pendingResponse)
        setPendingResponse(null)
    }
}, [pendingResponse, isOpen, isListening, isSpeaking])
```

### Done Button Click
```javascript
onClick={() => {
    if (isListening) {
        stopListening()
        if (currentMessage.trim()) {
            setIsWaitingForResponse(true)
            onMessageSend(currentMessage)
            setCurrentMessage('')
        }
    } else if (!isSpeaking && !isWaitingForResponse) {
        startListening()
    }
}}
```

## Benefits of Continuous Flow

1. **Natural Conversation**: Mimics real human dialogue
2. **Hands-Free**: No need to keep clicking "Start"
3. **Seamless**: Smooth transitions between states
4. **Clear Feedback**: Always know what state you're in
5. **Efficient**: Saves time with auto-listening
6. **User Control**: Can still manually control with buttons

## Edge Cases Handled

### 1. Modal Closes During Speaking
- All speech is cancelled
- Recognition is stopped
- Clean state reset

### 2. Empty Message
- Won't send if message is empty
- Won't transition to thinking state
- Stays in listening mode

### 3. API Error
- Error state handled
- Resets to listening mode
- User can try again

### 4. Speech Recognition Error
- Graceful error handling
- Returns to idle state
- User can restart manually

### 5. Multiple Rapid Clicks
- Buttons disabled during speaking/thinking
- Prevents state conflicts
- Visual feedback (grayed out)

## User Control Options

### Manual Control
1. **Done Button**: Stop listening and send message
2. **Start Button**: Begin listening (when idle)
3. **Orb Tap**: Toggle listening (quick control)
4. **Close Button**: Exit modal completely

### Automatic Flow
1. **Auto-Listen After Response**: System restarts listening
2. **Auto-Send on Done**: Message sent immediately
3. **Auto-Speak Response**: Response played automatically

## Testing Checklist

- [ ] Start button begins listening
- [ ] Done button stops and sends message
- [ ] Thinking state shows while waiting for API
- [ ] Response is spoken automatically
- [ ] Listening restarts after speech ends
- [ ] Button states update correctly
- [ ] Status text reflects current state
- [ ] Orb animations match states
- [ ] Empty messages don't send
- [ ] Close button stops everything
- [ ] Multiple conversation cycles work
- [ ] Error states handled gracefully

## Customization Options

### Adjust Auto-Listen Delay
Change the delay before restarting listening:
```javascript
setTimeout(() => {
    if (isOpen) {
        startListening()
    }
}, 500) // Change this value (milliseconds)
```

### Disable Auto-Listen
To make it manual only, remove the auto-restart:
```javascript
utterance.onend = () => {
    setIsSpeaking(false)
    // Don't auto-restart - user must click Start
}
```

### Change Button Labels
Modify the button text in the JSX:
```javascript
isListening ? 'Done' : 'Start'
// Change to:
isListening ? 'Finish' : 'Talk'
```

## Troubleshooting

**Problem**: Auto-listen doesn't start after speaking
- **Check**: Modal is still open (`isOpen === true`)
- **Check**: 500ms delay hasn't been interrupted
- **Solution**: Increase delay or check for conflicts

**Problem**: Button stuck in "Thinking..." state
- **Check**: API response is being received
- **Check**: `setPendingResponse()` is being called
- **Solution**: Add timeout to reset state

**Problem**: Multiple messages sent
- **Check**: Button is properly disabled during waiting
- **Check**: Message is cleared after sending
- **Solution**: Verify state management

## Future Enhancements

1. **Voice Activity Detection**: Stop automatically when user finishes speaking
2. **Interrupt Speaking**: Allow user to interrupt AI mid-response
3. **Volume Control**: Adjust TTS volume
4. **Speed Control**: Adjust speaking rate
5. **Background Listening**: Continue listening even when minimized
6. **Context Awareness**: Remember conversation context across cycles
7. **Visual Transcript**: Show full conversation history
8. **Save Conversation**: Export chat transcript
