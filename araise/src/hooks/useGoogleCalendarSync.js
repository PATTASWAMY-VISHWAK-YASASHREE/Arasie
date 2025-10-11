import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useCalendarSyncStore from '../store/calendarSyncStore';
import { useUserStore } from '../store/userStore';
import useSettingsStore from '../store/settingsStore';
import { CALENDAR_SCOPE, syncUserCalendar } from '../services/GoogleCalendarService';
import {
  initializeTokenClient,
  requestAccessToken,
  revokeAccess
} from '../services/GoogleIdentityService';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const selectCalendarSyncState = (userId) => (state) => {
  if (!userId) {
    return null;
  }
  return state.perUser[userId] || null;
};

const shallowReferenceCompare = (next, prev) => {
  if (!prev) {
    return false;
  }
  return (
    next.workoutHistory === prev.workoutHistory &&
    next.focusTasks === prev.focusTasks &&
    next.focusLogs === prev.focusLogs &&
    next.calendar === prev.calendar &&
    next.mentalHealthLogs === prev.mentalHealthLogs &&
    next.streakCount === prev.streakCount
  );
};

const prepareUserData = (state) => ({
  workoutHistory: state.workoutHistory || [],
  focusTasks: state.focusTasks || [],
  focusLogs: state.focusLogs || [],
  calendar: state.calendar || [],
  mentalHealthLogs: state.mentalHealthLogs || [],
  streakCount: state.streakCount || 0
});

export const useGoogleCalendarSync = () => {
  const user = useUserStore((state) => state.user);
  const userId = user?.uid;

  const autoSyncPreference = useSettingsStore((state) => state.preferences.autoSync);
  const timezonePreference = useSettingsStore((state) => state.preferences.timezone);

  const userSyncState = useCalendarSyncStore(
    useMemo(() => selectCalendarSyncState(userId), [userId])
  );

  const setSyncEnabled = useCalendarSyncStore((state) => state.setSyncEnabled);
  const setLastError = useCalendarSyncStore((state) => state.setLastError);

  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const lastTokenRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const syncingRef = useRef(false);

  const collectUserData = useCallback(() => {
    const state = useUserStore.getState();
    return prepareUserData(state);
  }, []);

  const effectiveTimezone = useMemo(() => {
    if (timezonePreference && timezonePreference !== 'auto') {
      return timezonePreference;
    }
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, [timezonePreference]);

  const performSync = useCallback(async ({ prompt = '', enableSync = false } = {}) => {
    if (!userId) {
      throw new Error('No authenticated user available for calendar sync.');
    }
    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable.');
    }
    if (syncingRef.current) {
      return null;
    }

    syncingRef.current = true;
    setIsSyncing(true);
    setStatusMessage(prompt === 'consent' ? 'Linking Google Calendar…' : 'Syncing with Google Calendar…');

    try {
      await initializeTokenClient({
        clientId: GOOGLE_CLIENT_ID,
        scope: CALENDAR_SCOPE,
        onError: (err) => {
          setLastError(userId, err.message);
        }
      });

      const tokenResponse = await requestAccessToken({ prompt });
      const accessToken = tokenResponse?.access_token;
      if (!accessToken) {
        throw new Error('Failed to obtain Google Calendar access token.');
      }

      lastTokenRef.current = accessToken;
      setLastError(userId, null);

      const result = await syncUserCalendar({
        userId,
        accessToken,
        userData: collectUserData(),
        timezone: effectiveTimezone,
        calendarStoreState: useCalendarSyncStore.getState()
      });

      if (enableSync) {
        setSyncEnabled(userId, true);
      }

      setStatusMessage(`Synced ${result?.syncedCount ?? 0} items to Google Calendar.`);
      return result;
    } catch (error) {
      console.error('Google Calendar sync error:', error);
      setLastError(userId, error.message || 'Google Calendar sync failed.');
      setStatusMessage(error.message || 'Unable to sync with Google Calendar.');
      throw error;
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [collectUserData, effectiveTimezone, setLastError, setSyncEnabled, userId]);

  const queueSync = useCallback((reason, options = {}) => {
    if (!userId || syncingRef.current) {
      return;
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    const delay = reason === 'manual' ? 0 : 1500;
    syncTimeoutRef.current = setTimeout(() => {
      performSync(options).catch(() => {
        // Errors handled in performSync
      });
    }, delay);
  }, [performSync, userId]);

  const connectAndSync = useCallback(async () => {
    await performSync({ prompt: 'consent', enableSync: true });
  }, [performSync]);

  const manualSync = useCallback(async () => {
    await performSync({ prompt: '' });
  }, [performSync]);

  const disconnect = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable.');
      }

      let token = lastTokenRef.current;
      if (!token) {
        try {
          await initializeTokenClient({ clientId: GOOGLE_CLIENT_ID, scope: CALENDAR_SCOPE });
          const response = await requestAccessToken({ prompt: '' });
          token = response?.access_token;
        } catch (err) {
          console.warn('Unable to obtain access token for revocation:', err);
        }
      }

      if (token) {
        await revokeAccess(token);
      }
    } catch (error) {
      console.error('Error revoking Google Calendar access:', error);
    } finally {
      setSyncEnabled(userId, false);
      setLastError(userId, null);
      setStatusMessage('Google Calendar sync disabled.');
    }
  }, [setLastError, setSyncEnabled, userId]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (!userSyncState?.enabled || !autoSyncPreference) {
      return;
    }

    const selector = (state) => prepareUserData(state);
    const unsubscribe = useUserStore.subscribe(
      selector,
      (next, prev) => {
        if (!shallowReferenceCompare(next, prev)) {
          queueSync('auto', { prompt: '' });
        }
      }
    );

    return () => {
      unsubscribe?.();
    };
  }, [autoSyncPreference, queueSync, userId, userSyncState?.enabled]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (!userSyncState?.enabled || !autoSyncPreference) {
      return;
    }

    queueSync('initial', { prompt: '' });
  }, [autoSyncPreference, queueSync, userId, userSyncState?.enabled]);

  return {
    isSyncing,
    statusMessage,
    syncEnabled: Boolean(userSyncState?.enabled),
    lastSyncedAt: userSyncState?.lastSyncedAt || null,
    lastError: userSyncState?.lastError || null,
    connectAndSync,
    manualSync,
    disconnect
  };
};

export default useGoogleCalendarSync;
