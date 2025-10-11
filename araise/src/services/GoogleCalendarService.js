import { useCalendarSyncStore } from '../store/calendarSyncStore';

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_EVENTS_ENDPOINT = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

const addDays = (dateString, days = 1) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const packSyncedEntry = (localKey, eventId) => `${localKey}::${eventId}`;

const unpackSyncedArray = (entries = []) => {
  return entries.reduce((acc, entry) => {
    const [localKey, eventId] = String(entry).split('::');
    if (localKey && eventId) {
      acc[localKey] = eventId;
    }
    return acc;
  }, {});
};

const getTimezone = (explicitTimezone) => {
  if (explicitTimezone && explicitTimezone !== 'auto') {
    return explicitTimezone;
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

const toIsoDateTime = (dateString, timeString = '09:00') => {
  try {
    const iso = new Date(`${dateString}T${timeString}:00`);
    if (Number.isNaN(iso.getTime())) {
      return null;
    }
    return iso.toISOString();
  } catch {
    return null;
  }
};

const buildWorkoutEvent = (workout) => {
  if (!workout?.date) {
    return null;
  }

  const summary = `Workout: ${workout.planName || workout.type || 'Training Session'}`;

  const descriptionLines = [];
  if (workout.duration) {
    descriptionLines.push(`Duration: ${workout.duration} minutes`);
  }
  if (Array.isArray(workout.exercises) && workout.exercises.length > 0) {
    descriptionLines.push('Exercises:');
    workout.exercises.forEach((exercise) => {
      if (!exercise) return;
      const label = exercise.exerciseName || exercise.name || 'Exercise';
      const details = [];
      if (exercise.sets) {
        details.push(`${exercise.sets} sets`);
      }
      if (exercise.reps) {
        details.push(`${exercise.reps} reps`);
      }
      if (exercise.duration) {
        details.push(`${exercise.duration} min`);
      }
      if (exercise.distance) {
        details.push(`${exercise.distance} km`);
      }
      if (exercise.calories) {
        details.push(`${exercise.calories} kcal`);
      }
      descriptionLines.push(`• ${label}${details.length ? ` (${details.join(', ')})` : ''}`);
    });
  }
  if (workout.totalCalories) {
    descriptionLines.push(`Total Calories: ${workout.totalCalories}`);
  }
  if (workout.totalDistance) {
    descriptionLines.push(`Distance: ${workout.totalDistance}`);
  }

  return {
    summary,
    description: descriptionLines.join('\n'),
    start: { date: workout.date },
    end: { date: addDays(workout.date, 1) },
    reminders: { useDefault: true },
    extendedProperties: {
      private: {
        araiseType: workout.type || 'workout',
        araiseLocalId: String(workout.id || `${workout.date}:${workout.planName || 'session'}`)
      }
    }
  };
};

const buildFocusTaskEvent = (task, timezone) => {
  if (!task?.date) {
    return null;
  }

  const startTime = toIsoDateTime(task.date, task.startTime || '09:00');
  const endTime = task.endTime ? toIsoDateTime(task.date, task.endTime) : null;
  let computedEnd = endTime;

  if (!computedEnd && startTime) {
    const durationMinutes = task.planned || task.focusDuration || 25;
    const endDate = new Date(startTime);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    computedEnd = endDate.toISOString();
  }

  if (!startTime || !computedEnd) {
    return null;
  }

  const descriptionLines = [];
  if (task.category) {
    descriptionLines.push(`Category: ${task.category}`);
  }
  if (task.focusMode) {
    descriptionLines.push('Focus Mode enabled');
  }
  if (task.cycles) {
    descriptionLines.push(`Cycles: ${task.cycles}`);
  }
  if (task.breakDuration) {
    descriptionLines.push(`Breaks: ${task.breakDuration} minutes`);
  }

  const recurrence = [];
  if (task.repeat && task.repeat !== 'none') {
    const freq = task.repeat === 'daily' ? 'DAILY' : 'WEEKLY';
    let rrule = `FREQ=${freq}`;
    if (task.repeatUntil) {
      const untilDate = toIsoDateTime(task.repeatUntil, task.endTime || task.startTime || '23:59');
      if (untilDate) {
        const untilStamp = untilDate.replace(/[-:]/g, '').split('.')[0];
        rrule = `${rrule};UNTIL=${untilStamp.replace('Z', '')}Z`;
      }
    }
    recurrence.push(`RRULE:${rrule}`);
  }

  return {
    summary: task.title || task.name || 'Focus Session',
    description: descriptionLines.join('\n'),
    start: { dateTime: startTime, timeZone: timezone },
    end: { dateTime: computedEnd, timeZone: timezone },
    reminders: { useDefault: true },
    recurrence,
    extendedProperties: {
      private: {
        araiseType: 'focus-task',
        araiseLocalId: String(task.id || `${task.date}:${task.title || task.name}`)
      }
    }
  };
};

const buildFocusSessionEvent = (session, timezone) => {
  if (!session?.time) {
    return null;
  }

  const start = new Date(session.time);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  const durationMinutes = session.duration || 25;
  end.setMinutes(end.getMinutes() + durationMinutes);

  const summary = `Focus Session: ${session.task || 'Focus Work'}`;
  const descriptionLines = [`Duration: ${durationMinutes} minutes`, `Completed: ${session.completed ? 'Yes' : 'Partial'}`];

  return {
    summary,
    description: descriptionLines.join('\n'),
    start: { dateTime: start.toISOString(), timeZone: timezone },
    end: { dateTime: end.toISOString(), timeZone: timezone },
    reminders: { useDefault: false },
    extendedProperties: {
      private: {
        araiseType: 'focus-session',
        araiseLocalId: String(session.id || `${session.time}:${session.task}`)
      }
    }
  };
};

const buildStreakEvent = (entry, streakCount) => {
  if (!entry?.date) {
    return null;
  }

  const summary = 'ARAISE Streak Day';
  const description = `Congratulations! You maintained your streak on ${entry.date}. Current streak: ${streakCount} days.`;

  return {
    summary,
    description,
    start: { date: entry.date },
    end: { date: addDays(entry.date, 1) },
    reminders: { useDefault: false },
    extendedProperties: {
      private: {
        araiseType: 'streak',
        araiseLocalId: String(entry.date)
      }
    }
  };
};

const buildMentalLogEvent = (log, timezone) => {
  if (!log?.time) {
    return null;
  }

  const start = new Date(log.time);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  const durationMinutes = log.duration || 15;
  end.setMinutes(end.getMinutes() + durationMinutes);

  const summary = `Mental Wellness: ${log.activity || log.type || 'Session'}`;
  const descriptionLines = [];
  if (log.mood) {
    descriptionLines.push(`Mood: ${log.mood}`);
  }
  if (log.journalEntry) {
    descriptionLines.push(`Journal: ${log.journalEntry}`);
  }
  if (log.duration) {
    descriptionLines.push(`Duration: ${log.duration} minutes`);
  }

  return {
    summary,
    description: descriptionLines.join('\n'),
    start: { dateTime: start.toISOString(), timeZone: timezone },
    end: { dateTime: end.toISOString(), timeZone: timezone },
    reminders: { useDefault: false },
    extendedProperties: {
      private: {
        araiseType: 'mental-wellness',
        araiseLocalId: String(log.id || log.time)
      }
    }
  };
};

const buildSyncItems = ({
  userData,
  timezone
}) => {
  const items = [];

  if (!userData) {
    return items;
  }

  const {
    workoutHistory = [],
    focusTasks = [],
    focusLogs = [],
    calendar = [],
    mentalHealthLogs = [],
    streakCount = 0
  } = userData;

  workoutHistory.forEach((workout) => {
    const event = buildWorkoutEvent(workout);
    if (event) {
      const localId = workout.id || `${workout.date}:${workout.planName || workout.type || 'session'}`;
      items.push({
        type: 'workouts',
        localKey: `workout:${localId}`,
        event
      });
    }
  });

  focusTasks.forEach((task) => {
    const event = buildFocusTaskEvent(task, timezone);
    if (event) {
      const localId = task.id || `${task.date}:${task.title || task.name}`;
      items.push({
        type: 'focusTasks',
        localKey: `focusTask:${localId}`,
        event
      });
    }
  });

  focusLogs.forEach((session) => {
    const event = buildFocusSessionEvent(session, timezone);
    if (event) {
      const localId = session.id || session.time;
      items.push({
        type: 'focusSessions',
        localKey: `focusSession:${localId}`,
        event
      });
    }
  });

  calendar
    .filter((entry) => entry?.completed && entry.date)
    .forEach((entry) => {
      const event = buildStreakEvent(entry, streakCount);
      if (event) {
        items.push({
          type: 'streakDates',
          localKey: `streak:${entry.date}`,
          event
        });
      }
    });

  mentalHealthLogs.forEach((log) => {
    const event = buildMentalLogEvent(log, timezone);
    if (event) {
      const localId = log.id || log.time;
      items.push({
        type: 'mentalLogs',
        localKey: `mental:${localId}`,
        event
      });
    }
  });

  return items;
};

const apiRequest = async (accessToken, url, options = {}) => {
  const response = await fetch(url, {
    method: 'GET',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const errorMessage = errorPayload?.error?.message || response.statusText || 'Google Calendar API error';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = errorPayload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const createEvent = (accessToken, event) => {
  return apiRequest(accessToken, CALENDAR_EVENTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(event)
  });
};

const updateEvent = (accessToken, eventId, event) => {
  return apiRequest(accessToken, `${CALENDAR_EVENTS_ENDPOINT}/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    body: JSON.stringify(event)
  });
};

export const syncUserCalendar = async ({
  userId,
  accessToken,
  userData,
  timezone,
  calendarStoreState
}) => {
  if (!userId) {
    throw new Error('User ID is required to sync calendar data.');
  }
  if (!accessToken) {
    throw new Error('Access token missing for Google Calendar sync.');
  }

  const store = calendarStoreState || useCalendarSyncStore.getState();

  store.setLastAttemptAt(userId, new Date().toISOString());

  const userState = store.getUserState(userId);
  const syncedMaps = Object.entries(userState.syncedItems || {}).reduce((acc, [type, entries]) => {
    acc[type] = unpackSyncedArray(entries);
    return acc;
  }, {});

  const tz = getTimezone(timezone);
  const syncItems = buildSyncItems({ userId, userData, timezone: tz });

  const updatesByType = {};
  const errors = [];

  for (const item of syncItems) {
    const typeMap = syncedMaps[item.type] || {};
    const existingEventId = typeMap[item.localKey];

    try {
      let targetEventId = existingEventId;
      if (existingEventId) {
        await updateEvent(accessToken, existingEventId, item.event);
      } else {
        const response = await createEvent(accessToken, item.event);
        targetEventId = response?.id;
      }

      if (targetEventId) {
        const packed = packSyncedEntry(item.localKey, targetEventId);
        if (!updatesByType[item.type]) {
          updatesByType[item.type] = [];
        }
        updatesByType[item.type].push(packed);
      }
    } catch (error) {
      console.error('Failed to sync calendar item', item.localKey, error);
      errors.push({ item, error });
    }
  }

  if (Object.keys(updatesByType).length > 0) {
    store.recordBulkSynced(userId, updatesByType);
    store.setLastSyncedAt(userId, new Date().toISOString());
    store.setLastError(userId, null);
  }

  if (errors.length > 0) {
    const firstError = errors[0].error;
    store.setLastError(userId, firstError?.message || 'Some items failed to sync to Google Calendar.');
    const details = errors.map(({ item, error: err }) => `${item.localKey}: ${err.message || 'Failed'}`).join('; ');
    throw new Error(`Google Calendar sync completed with errors: ${details}`);
  }

  return {
    syncedCount: syncItems.length,
    updatedTypes: Object.keys(updatesByType)
  };
};

export default {
  CALENDAR_SCOPE,
  syncUserCalendar
};

export const __testables = {
  addDays,
  toIsoDateTime,
  buildWorkoutEvent,
  buildFocusTaskEvent,
  buildFocusSessionEvent,
  buildStreakEvent,
  buildMentalLogEvent,
  buildSyncItems,
  unpackSyncedArray,
  packSyncedEntry
};
