import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const createUserSyncState = () => ({
  enabled: false,
  lastSyncedAt: null,
  lastAttemptAt: null,
  lastError: null,
  syncedItems: {
    workouts: [],
    cardioWorkouts: [],
    focusSessions: [],
    focusTasks: [],
    streakDates: [],
    mentalLogs: []
  }
});

const mergeValues = (existing = [], incoming = []) => {
  const merged = new Set((existing || []).map(String));
  (incoming || []).forEach((value) => {
    if (value !== undefined && value !== null) {
      merged.add(String(value));
    }
  });
  return Array.from(merged);
};

export const useCalendarSyncStore = create(
  persist(
    (set, get) => ({
      perUser: {},

      ensureUserState: (userId) => {
        if (!userId) {
          return createUserSyncState();
        }

        const existing = get().perUser[userId];
        if (existing) {
          return existing;
        }

        const initialState = createUserSyncState();
        set((state) => ({
          perUser: {
            ...state.perUser,
            [userId]: initialState
          }
        }));
        return initialState;
      },

      getUserState: (userId) => {
        if (!userId) {
          return createUserSyncState();
        }
        return get().perUser[userId] || createUserSyncState();
      },

      isSyncEnabled: (userId) => {
        if (!userId) {
          return false;
        }
        return !!get().perUser[userId]?.enabled;
      },

      setSyncEnabled: (userId, enabled) => {
        if (!userId) {
          return;
        }

        set((state) => {
          const current = state.perUser[userId] || createUserSyncState();
          return {
            perUser: {
              ...state.perUser,
              [userId]: {
                ...current,
                enabled,
                lastError: null
              }
            }
          };
        });
      },

      recordSyncedItems: (userId, type, keys) => {
        if (!userId || !type || !Array.isArray(keys) || keys.length === 0) {
          return;
        }

        set((state) => {
          const current = state.perUser[userId] || createUserSyncState();
          const currentSynced = current.syncedItems[type] || [];
          const updatedSynced = mergeValues(currentSynced, keys);

          return {
            perUser: {
              ...state.perUser,
              [userId]: {
                ...current,
                syncedItems: {
                  ...current.syncedItems,
                  [type]: updatedSynced
                }
              }
            }
          };
        });
      },

      recordBulkSynced: (userId, syncedMap) => {
        if (!userId || !syncedMap) {
          return;
        }

        set((state) => {
          const current = state.perUser[userId] || createUserSyncState();
          const nextSynced = { ...current.syncedItems };

          Object.entries(syncedMap).forEach(([type, keys]) => {
            if (Array.isArray(keys) && keys.length > 0 && nextSynced[type]) {
              nextSynced[type] = mergeValues(nextSynced[type], keys);
            }
          });

          return {
            perUser: {
              ...state.perUser,
              [userId]: {
                ...current,
                syncedItems: nextSynced
              }
            }
          };
        });
      },

      setLastSyncedAt: (userId, isoString) => {
        if (!userId) {
          return;
        }

        set((state) => {
          const current = state.perUser[userId] || createUserSyncState();
          return {
            perUser: {
              ...state.perUser,
              [userId]: {
                ...current,
                lastSyncedAt: isoString || new Date().toISOString()
              }
            }
          };
        });
      },

      setLastAttemptAt: (userId, isoString) => {
        if (!userId) {
          return;
        }

        set((state) => {
          const current = state.perUser[userId] || createUserSyncState();
          return {
            perUser: {
              ...state.perUser,
              [userId]: {
                ...current,
                lastAttemptAt: isoString || new Date().toISOString()
              }
            }
          };
        });
      },

      setLastError: (userId, errorMessage) => {
        if (!userId) {
          return;
        }

        set((state) => {
          const current = state.perUser[userId] || createUserSyncState();
          return {
            perUser: {
              ...state.perUser,
              [userId]: {
                ...current,
                lastError: errorMessage || null
              }
            }
          };
        });
      },

      clearUser: (userId) => {
        if (!userId) {
          return;
        }

        set((state) => {
          const { [userId]: _, ...rest } = state.perUser;
          return {
            perUser: rest
          };
        });
      }
    }),
    {
      name: 'calendar-sync-store'
    }
  )
);

export default useCalendarSyncStore;
