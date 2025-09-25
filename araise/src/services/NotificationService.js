class NotificationService {
  constructor() {
    this.permission = 'default'
    this.init()
  }

  init() {
    if ('Notification' in window) {
      this.permission = Notification.permission
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === 'granted'
  }

  async showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        return false
      }
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'araise-notification',
      requireInteraction: false,
      silent: false,
      ...options
    }

    try {
      const notification = new Notification(title, defaultOptions)
      
      // Auto close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return false
    }
  }

  // Predefined notification types for ARAISE
  showWorkoutReminder(workoutType = 'workout') {
    return this.showNotification('Time for your workout! 💪', {
      body: `Your ${workoutType} session is ready. Let's get moving!`,
      icon: '/workout-icon.png',
      tag: 'workout-reminder'
    })
  }

  showWaterReminder() {
    return this.showNotification('Stay hydrated! 💧', {
      body: 'Time to drink some water and keep your body refreshed.',
      icon: '/water-icon.png',
      tag: 'water-reminder'
    })
  }

  showMeditationReminder() {
    return this.showNotification('Mindfulness moment 🧘‍♀️', {
      body: 'Take a few minutes to center yourself with meditation.',
      icon: '/meditation-icon.png',
      tag: 'meditation-reminder'
    })
  }

  showFocusReminder() {
    return this.showNotification('Focus time! 🎯', {
      body: 'Ready to tackle your tasks with deep focus?',
      icon: '/focus-icon.png',
      tag: 'focus-reminder'
    })
  }

  showAchievementUnlocked(achievement) {
    return this.showNotification('Achievement Unlocked! 🏆', {
      body: `Congratulations! You've earned: ${achievement}`,
      icon: '/achievement-icon.png',
      tag: 'achievement',
      requireInteraction: true
    })
  }

  showStreakMilestone(days) {
    return this.showNotification(`${days} Day Streak! 🔥`, {
      body: `Amazing! You've maintained your wellness routine for ${days} days straight!`,
      icon: '/streak-icon.png',
      tag: 'streak-milestone',
      requireInteraction: true
    })
  }

  showDailyGoalComplete() {
    return this.showNotification('Daily Goals Complete! ✨', {
      body: 'Fantastic work! You\'ve completed all your daily wellness goals.',
      icon: '/complete-icon.png',
      tag: 'daily-complete'
    })
  }

  // Schedule recurring notifications
  scheduleWaterReminders(intervalMinutes = 60) {
    if (this.waterReminderInterval) {
      clearInterval(this.waterReminderInterval)
    }

    this.waterReminderInterval = setInterval(() => {
      this.showWaterReminder()
    }, intervalMinutes * 60 * 1000)
  }

  scheduleWorkoutReminder(hour = 9, minute = 0) {
    // Schedule daily workout reminder
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.showWorkoutReminder()
      // Schedule for next day
      this.scheduleWorkoutReminder(hour, minute)
    }, timeUntilReminder)
  }

  scheduleMeditationReminder(hour = 20, minute = 0) {
    // Schedule daily meditation reminder
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.showMeditationReminder()
      // Schedule for next day
      this.scheduleMeditationReminder(hour, minute)
    }, timeUntilReminder)
  }

  // Clear all scheduled notifications
  clearAllScheduled() {
    if (this.waterReminderInterval) {
      clearInterval(this.waterReminderInterval)
    }
  }

  // Check if notifications are supported and enabled
  isSupported() {
    return 'Notification' in window
  }

  isEnabled() {
    return this.permission === 'granted'
  }

  getPermissionStatus() {
    return this.permission
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService