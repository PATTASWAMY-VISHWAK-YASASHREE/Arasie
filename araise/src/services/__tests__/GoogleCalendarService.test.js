import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncUserCalendar, __testables } from '../GoogleCalendarService';
import { useCalendarSyncStore } from '../../store/calendarSyncStore';

const {
  buildWorkoutEvent,
  buildFocusTaskEvent
} = __testables;

const mockFetchSuccess = () => {
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: 'event-123' })
  }));
};

const mockFetchFailure = (message = 'Request failed', status = 401) => {
  globalThis.fetch = vi.fn(async () => ({
    ok: false,
    status,
    json: async () => ({ error: { message } })
  }));
};

beforeEach(() => {
  vi.restoreAllMocks();
  if (globalThis.localStorage?.clear) {
    globalThis.localStorage.clear();
  }
  useCalendarSyncStore.setState({ perUser: {} });
});

describe('GoogleCalendarService helpers', () => {
  it('builds workout events with detailed descriptions', () => {
    const event = buildWorkoutEvent({
      id: 'w-1',
      date: '2025-10-10',
      planName: 'Strength Builder',
      duration: 45,
      exercises: [
        { exerciseName: 'Bench Press', sets: 4, reps: 8 },
        { exerciseName: 'Squat', sets: 5, reps: 5 }
      ],
      totalCalories: 520
    });

    expect(event).toBeTruthy();
    expect(event.summary).toBe('Workout: Strength Builder');
    expect(event.start.date).toBe('2025-10-10');
    expect(event.end.date).toBe('2025-10-11');
    expect(event.description).toContain('Duration: 45 minutes');
    expect(event.description).toContain('Bench Press');
    expect(event.extendedProperties.private.araiseLocalId).toBe('w-1');
  });

  it('builds focus task events with recurrence metadata', () => {
    const event = buildFocusTaskEvent({
      id: 'focus-1',
      date: '2025-10-11',
      startTime: '08:30',
      endTime: '09:15',
      title: 'Deep Work',
      repeat: 'daily',
      repeatUntil: '2025-10-15'
    }, 'America/New_York');

    expect(event).toBeTruthy();
    expect(event.start.timeZone).toBe('America/New_York');
    expect(event.recurrence[0]).toContain('FREQ=DAILY');
    expect(event.summary).toBe('Deep Work');
  });
});

describe('syncUserCalendar', () => {
  const userId = 'user-123';

  it('creates events and records synced items when API succeeds', async () => {
    mockFetchSuccess();

    const result = await syncUserCalendar({
      userId,
      accessToken: 'token-abc',
      userData: {
        workoutHistory: [
          {
            id: 'w-1',
            date: '2025-10-12',
            planName: 'Cardio Blast'
          }
        ]
      },
      timezone: 'UTC'
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/calendar/v3/calendars/primary/events'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.syncedCount).toBe(1);

    const userState = useCalendarSyncStore.getState().getUserState(userId);
    expect(userState.syncedItems.workouts).toHaveLength(1);
    expect(userState.lastError).toBeNull();
  });

  it('surfaces errors when API calls fail and updates store error state', async () => {
    mockFetchFailure('Invalid credentials', 401);

    await expect(syncUserCalendar({
      userId,
      accessToken: 'bad-token',
      userData: {
        workoutHistory: [
          {
            id: 'w-err',
            date: '2025-10-12',
            planName: 'Test Plan'
          }
        ]
      },
      timezone: 'UTC'
    })).rejects.toThrow(/Invalid credentials/);

    const userState = useCalendarSyncStore.getState().getUserState(userId);
    expect(userState.lastError).toContain('Invalid credentials');
    expect(userState.syncedItems.workouts).toHaveLength(0);
  });

  it('throws when required parameters are missing', async () => {
    await expect(syncUserCalendar({
      userId: '',
      accessToken: 'token',
      userData: {},
      timezone: 'UTC'
    })).rejects.toThrow(/User ID is required/);

    await expect(syncUserCalendar({
      userId,
      accessToken: '',
      userData: {},
      timezone: 'UTC'
    })).rejects.toThrow(/Access token missing/);
  });
});
