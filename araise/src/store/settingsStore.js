import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import notificationService from '../services/NotificationService'

const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Notification Settings
      notifications: {
        push: true,
        email: true,
        sms: false,
        workout: true,
        water: true,
        meditation: true,
        focus: true,
        achievements: true,
        reminders: true,
        social: false,
        marketing: false
      },

      // App Preferences
      preferences: {
        darkMode: true,
        soundEnabled: true,
        vibration: true,
        autoSync: true,
        offlineMode: false,
        dataUsage: 'wifi-only', // 'always', 'wifi-only', 'never'
        language: 'en-US',
        timezone: 'auto',
        units: 'metric', // 'metric', 'imperial'
        animations: true,
        hapticFeedback: true
      },

      // Privacy Settings
      privacy: {
        profileVisibility: 'friends', // 'public', 'friends', 'private'
        shareProgress: true,
        shareAchievements: false,
        allowAnalytics: true,
        allowCrashReports: true,
        locationServices: false,
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showStats: true,
        allowMessages: true,
        showOnlineStatus: true
      },

      // Reminder Schedules
      reminderSchedules: {
        workout: { enabled: true, hour: 9, minute: 0 },
        water: { enabled: true, intervalMinutes: 60 },
        meditation: { enabled: true, hour: 20, minute: 0 },
        focus: { enabled: false, hour: 14, minute: 0 }
      },

      // Actions
      updateNotificationSetting: (key, value) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value
          }
        }))

        // Handle notification permission and scheduling
        const { notifications, reminderSchedules } = get()
        
        if (key === 'push' && value) {
          notificationService.requestPermission()
        }

        // Update reminder schedules based on notification preferences
        if (key === 'water' && value && notifications.push) {
          if (reminderSchedules.water.enabled) {
            notificationService.scheduleWaterReminders(reminderSchedules.water.intervalMinutes)
          }
        } else if (key === 'water' && !value) {
          notificationService.clearAllScheduled()
        }

        if (key === 'workout' && value && notifications.push) {
          if (reminderSchedules.workout.enabled) {
            notificationService.scheduleWorkoutReminder(
              reminderSchedules.workout.hour,
              reminderSchedules.workout.minute
            )
          }
        }

        if (key === 'meditation' && value && notifications.push) {
          if (reminderSchedules.meditation.enabled) {
            notificationService.scheduleMeditationReminder(
              reminderSchedules.meditation.hour,
              reminderSchedules.meditation.minute
            )
          }
        }
      },

      updatePreference: (key, value) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value
          }
        }))

        // Handle specific preference changes
        if (key === 'darkMode') {
          // Update document class for theme switching
          if (value) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }

        if (key === 'soundEnabled') {
          // Update global sound settings
          window.ARAISE_SOUND_ENABLED = value
        }

        if (key === 'vibration') {
          // Update haptic feedback settings
          window.ARAISE_VIBRATION_ENABLED = value
        }
      },

      updatePrivacySetting: (key, value) => {
        set((state) => ({
          privacy: {
            ...state.privacy,
            [key]: value
          }
        }))
      },

      updateReminderSchedule: (type, schedule) => {
        set((state) => ({
          reminderSchedules: {
            ...state.reminderSchedules,
            [type]: { ...state.reminderSchedules[type], ...schedule }
          }
        }))

        // Update actual notification schedules
        const { notifications } = get()
        
        if (schedule.enabled && notifications[type] && notifications.push) {
          switch (type) {
            case 'water':
              notificationService.scheduleWaterReminders(schedule.intervalMinutes)
              break
            case 'workout':
              notificationService.scheduleWorkoutReminder(schedule.hour, schedule.minute)
              break
            case 'meditation':
              notificationService.scheduleMeditationReminder(schedule.hour, schedule.minute)
              break
          }
        } else {
          notificationService.clearAllScheduled()
        }
      },

      // Initialize settings on app start
      initializeSettings: () => {
        const { preferences, notifications, reminderSchedules } = get()

        // Apply theme
        if (preferences.darkMode) {
          document.documentElement.classList.add('dark')
        }

        // Set global flags
        window.ARAISE_SOUND_ENABLED = preferences.soundEnabled
        window.ARAISE_VIBRATION_ENABLED = preferences.vibration

        // Initialize notifications if enabled
        if (notifications.push && notificationService.isSupported()) {
          notificationService.requestPermission().then((granted) => {
            if (granted) {
              // Schedule enabled reminders
              if (notifications.water && reminderSchedules.water.enabled) {
                notificationService.scheduleWaterReminders(reminderSchedules.water.intervalMinutes)
              }
              
              if (notifications.workout && reminderSchedules.workout.enabled) {
                notificationService.scheduleWorkoutReminder(
                  reminderSchedules.workout.hour,
                  reminderSchedules.workout.minute
                )
              }
              
              if (notifications.meditation && reminderSchedules.meditation.enabled) {
                notificationService.scheduleMeditationReminder(
                  reminderSchedules.meditation.hour,
                  reminderSchedules.meditation.minute
                )
              }
            }
          })
        }
      },

      // Export user data
      exportData: () => {
        const state = get()
        return {
          notifications: state.notifications,
          preferences: state.preferences,
          privacy: state.privacy,
          reminderSchedules: state.reminderSchedules,
          exportDate: new Date().toISOString(),
          version: '1.0.0'
        }
      },

      // Import user data
      importData: (data) => {
        if (data.notifications) {
          set((state) => ({ notifications: { ...state.notifications, ...data.notifications } }))
        }
        if (data.preferences) {
          set((state) => ({ preferences: { ...state.preferences, ...data.preferences } }))
        }
        if (data.privacy) {
          set((state) => ({ privacy: { ...state.privacy, ...data.privacy } }))
        }
        if (data.reminderSchedules) {
          set((state) => ({ reminderSchedules: { ...state.reminderSchedules, ...data.reminderSchedules } }))
        }
        
        // Re-initialize settings after import
        get().initializeSettings()
      },

      // Reset to defaults
      resetToDefaults: () => {
        set({
          notifications: {
            push: true,
            email: true,
            sms: false,
            workout: true,
            water: true,
            meditation: true,
            focus: true,
            achievements: true,
            reminders: true,
            social: false,
            marketing: false
          },
          preferences: {
            darkMode: true,
            soundEnabled: true,
            vibration: true,
            autoSync: true,
            offlineMode: false,
            dataUsage: 'wifi-only',
            language: 'en-US',
            timezone: 'auto',
            units: 'metric',
            animations: true,
            hapticFeedback: true
          },
          privacy: {
            profileVisibility: 'friends',
            shareProgress: true,
            shareAchievements: false,
            allowAnalytics: true,
            allowCrashReports: true,
            locationServices: false,
            showEmail: false,
            showPhone: false,
            showLocation: true,
            showStats: true,
            allowMessages: true,
            showOnlineStatus: true
          },
          reminderSchedules: {
            workout: { enabled: true, hour: 9, minute: 0 },
            water: { enabled: true, intervalMinutes: 60 },
            meditation: { enabled: true, hour: 20, minute: 0 },
            focus: { enabled: false, hour: 14, minute: 0 }
          }
        })
        
        get().initializeSettings()
      }
    }),
    {
      name: 'araise-settings',
      version: 1,
      partialize: (state) => ({
        notifications: state.notifications,
        preferences: state.preferences,
        privacy: state.privacy,
        reminderSchedules: state.reminderSchedules
      })
    }
  )
)

export default useSettingsStore