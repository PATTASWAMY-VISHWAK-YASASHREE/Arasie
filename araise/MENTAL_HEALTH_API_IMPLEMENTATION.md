# Mental Health Chat API Implementation

## Overview
This document describes the implementation of the mental health chat feature using the custom API instead of Gemini API.

## API Base URL
```
https://mental-health-agent-0oib.onrender.com
```

## API Endpoints

### 1. Chat Query Endpoint
**URL:** `GET /query/{uid}`

**Description:** Send a user's mental health query and receive an AI response.

**Parameters:**
- `uid` (path parameter): Firebase user ID
- `query` (query parameter): User's message text
- `session_id` (query parameter, optional): Session ID for continuing an existing chat

**Response:**
```json
{
  "success": true,
  "session_id": "unique_session_identifier",
  "response": "AI's response text",
  "conversation_length": 1,
  "data_fetched": true,
  "timestamp": "ISO 8601 timestamp"
}
```

**Implementation Notes:**
- When starting a **new chat**, DO NOT include `session_id` in the request body
- When **continuing an existing chat**, include the `session_id` from previous responses
- The API returns a `session_id` which should be stored and used for subsequent messages in the same conversation

### 2. Session History Endpoint
**URL:** `GET /sessions/{uid}`

**Description:** Retrieve all chat session history for a user.

**Parameters:**
- `uid` (path parameter): Firebase user ID

**Response:**
```json
{
  "success": true,
  "uid": "firebase_user_id",
  "session_count": 3,
  "sessions": [
    {
      "session_id": "unique_session_id",
      "created_at": "ISO 8601 timestamp",
      "messages": [
        {
          "timestamp": "ISO 8601 timestamp",
          "assistant": "mental_health_ai",
          "query": "User's question",
          "role": "user",
          "response": "AI's response"
        }
      ],
      "message_count": 1,
      "data_fetched": true,
      "last_message": {
        "timestamp": "ISO 8601 timestamp",
        "assistant": "mental_health_ai",
        "query": "User's question",
        "role": "user",
        "response": "AI's response (truncated)"
      }
    }
  ]
}
```

**Note:** Each message object contains both `query` (user's message) and `response` (AI's reply). The frontend transforms this into separate user and assistant messages for display.

## Implementation Details

### Key Changes Made

1. **Removed Gemini API Integration**
   - Removed `@google/generative-ai` dependency usage
   - Removed Gemini API key reference
   - Removed `getAIResponse` function that called Gemini

2. **Updated Data Structure**
   - Changed from `id` to `session_id` for session identification
   - Changed message structure from `type: 'user'|'ai'` to `role: 'user'|'assistant'`
   - Updated timestamp handling to use ISO 8601 strings
   - Changed `date` field to `created_at` for sessions

3. **Session Management**
   - Sessions are now fetched from the API on component mount
   - New chats start with `session_id: null` and receive it from the first API response
   - Session history is loaded from the backend
   - Clicking on a history item loads that session's messages

4. **Message Flow**
   - User sends message → Added to local state immediately
   - Request sent to `/query/{uid}` endpoint
   - Response received with AI message and session_id
   - AI message added to local state
   - Session ID updated for future messages in the conversation

### Code Flow

```
User Opens Chat
    ↓
Fetch Sessions (/sessions/{uid})
    ↓
Display Session History in Sidebar
    ↓
User Selects Session or Starts New Chat
    ↓
Display Messages for Selected Session
    ↓
User Sends Message
    ↓
POST to /query/{uid} with query and session_id (if exists)
    ↓
Receive Response with AI message and session_id
    ↓
Update Local State with Response
    ↓
Continue Conversation (loop back to "User Sends Message")
```

### Component State Structure

```javascript
chatSessions = [
  {
    session_id: string | null,  // null for new chats
    title: string,
    created_at: string (ISO 8601),
    messages: [
      {
        role: 'user' | 'assistant',
        content: string,
        timestamp: string (ISO 8601)
      }
    ]
  }
]
```

### Authentication Integration
- Uses `useAuth()` hook to get `currentUser.uid`
- All API calls include the Firebase user ID in the URL path
- Sessions are user-specific and isolated

## Testing Checklist

- [ ] New chat creation works without session_id
- [ ] First message returns a session_id
- [ ] Subsequent messages in same chat use the session_id
- [ ] Session history loads on component mount
- [ ] Clicking history items loads the correct conversation
- [ ] Messages are displayed with correct avatars (N for Nivi, Y for You)
- [ ] Timestamps display correctly
- [ ] Voice modal integration still works
- [ ] Error handling works for API failures
- [ ] Loading states display correctly

## Error Handling

The implementation includes error handling for:
1. Failed session fetch on mount
2. Failed message send
3. Network errors
4. Invalid responses

Error messages are displayed to the user when API calls fail.

## Future Enhancements

Potential improvements:
1. Add message retry functionality
2. Implement optimistic updates with rollback
3. Add typing indicators
4. Cache sessions locally
5. Implement session search/filter
6. Add delete session functionality (backend required)
7. Add session export functionality
