# Google Calendar Sync Architecture

## Objectives

- Allow authenticated users to push schedule-oriented activity data (workouts, focus sessions, streaks, mental wellness logs) into their Google Calendar.
- Provide an explicit "Sync" action that grants Calendar permissions and initiates an initial export, then keep data in sync based on state changes without exposing additional UI clutter.
- Respect existing state management (`userStore`, `calendarSyncStore`, `settingsStore`) and avoid disruptive schema changes.

## Key Components

1. **GoogleIdentityLoader**
   - Lazily loads the Google Identity Services (GIS) script (`accounts.google.com/gsi/client`).
   - Exposes helpers to initialise a token client with the Calendar scope (`https://www.googleapis.com/auth/calendar.events`).
   - Supports requesting tokens with and without additional prompts, plus revoking consent when a user disables sync.

2. **GoogleCalendarService**
   - Wraps Calendar REST calls (`/calendar/v3/calendars/primary/events`).
   - Provides `syncAll` and granular sync methods per domain entity (workouts, focus sessions, streaks, mental logs).
   - Handles deduplication/update decisions using `calendarSyncStore` metadata (stores `localKey:eventId` pairs).
   - Converts domain data into calendar event payloads with sensible summaries/descriptions.

3. **GoogleCalendarSyncHook**
   - React hook that orchestrates token acquisition, service invocation, and store updates.
   - Listens for relevant changes (user toggles auto-sync, new data) and queues sync requests with debouncing.
   - Surfaces status to UI consumers (syncing, last synced timestamp, last error).

4. **UI Integration**
   - Add a compact "Sync with Google Calendar" button within Settings > Data & Storage (or dedicated Sync section).
   - Button triggers token request; upon success, enables persistent sync for the user and kicks off a full export.
   - Provide contextual messaging for success/error; allow disabling sync (revoke token).

## Data Mapping Overview

| Domain Source (`useUserStore`) | Calendar Representation |
| --- | --- |
| `workoutHistory` (type `split`/`cardio`) | All-day event on recorded date titled `Workout: {planName}` with details of exercises; include duration.
| `focusTasks` | Timed event using `startTime`/`endTime`; include focus/break cycles and repeat meta in description.
| `focusLogs` (completed sessions) | Optional, convert to historical events if not already covered by tasks; recorded as completed sessions.
| `calendar` / `streakCount` | All-day milestone events `Streak Day` or `Milestone` when streak increments.
| `mentalHealthLogs` | Timed event capturing mood/journal snippet for reflection.
| `waterLogs`, `meals` (optional stretch) | Could become reminders but deferred to later iterations unless explicitly requested.

Each record generates a deterministic `localKey` (e.g., `workout:{id}`, `focusTask:{id}`, `streak:{date}`) to track the corresponding Google event ID.

## Sync Flow

1. User taps **Sync**.
2. Hook loads GIS script, initialises token client, and requests access (`prompt='consent'`).
3. On approval, store marks sync enabled and caches granted scopes.
4. Hook obtains access token (immediately via callback) and invokes `GoogleCalendarService.syncAll(token, userId, data)`.
5. Service loads previously synced mappings and compares with current domain data.
6. For new records → create Calendar events; for existing records → `PATCH` to update details; for deleted records → optionally remove or leave (initial iteration keeps existing events).
7. Record event IDs + keys in `calendarSyncStore`, set `lastSyncedAt`/`lastAttemptAt`, clear `lastError`.
8. Auto-sync: when relevant data or preferences change, hook requests a fresh token (`prompt=''`) and re-runs `syncAll` (debounced and gated by store `enabled` flag).

## Error Handling

- Token acquisition errors -> surface to UI, disable auto-sync until user retries.
- API failures -> capture message in `calendarSyncStore.lastError` and allow manual retry.
- Rate limiting -> implement exponential backoff or schedule future retry via hook (initial version: simple delay + message).

## Environment & Configuration

- Introduce `VITE_GOOGLE_CLIENT_ID` (web client ID from Google Cloud console).
- Ensure OAuth consent screen lists calendar scope and app verified for sensitive scope usage.

## Future Enhancements

- Support incremental exports (only sync deltas) and event deletions when local data removed.
- Provide user control over which categories sync.
- Add server-side refresh to avoid token prompts (requires backend updates).
