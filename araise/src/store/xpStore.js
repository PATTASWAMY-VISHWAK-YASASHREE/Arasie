import { create } from 'zustand'

const DEFAULT_DAILY_GOAL = 60 // Default 60 minutes of focus

// Default XP state
function getDefaultXpState() {
  return {
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: null,
    dailyXp: 0,
    lastStreakDate: null,
    firebaseService: null,
    userId: null
  }
}

export const useXpStore = create((set, get) => ({
  ...getDefaultXpState(),

  // Initialize store for specific user with Firebase service
  initializeForUser: async (userId, firebaseService) => {
    if (!firebaseService) {
      console.error('Firebase service required for XP store initialization')
      return
    }

    set({ userId, firebaseService })

    try {
      // Load XP data from Firebase
      const xpData = await firebaseService.loadXpData()
      set({ ...xpData, userId, firebaseService })
    } catch (error) {
      console.error('Error loading XP data:', error)
      // Use default state if loading fails
      set({ ...getDefaultXpState(), userId, firebaseService })
    }
  },

  // Set daily focus goal (in minutes) - now gets from userStore
  setDailyGoal: (minutes) => {
    // This method is kept for compatibility but the goal should come from userStore
    console.warn('setDailyGoal is deprecated, use userStore.updateFocusGoal instead')
  },

  awardXp: async (amount, dailyGoal = DEFAULT_DAILY_GOAL) => {
    const state = get()
    if (!state.firebaseService) {
      console.error('Firebase service not available for XP update')
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    let xp = Math.max(0, state.xp + amount) // Ensure XP doesn't go below 0
    let dailyXp = state.dailyXp
    let streakDays = state.streakDays
    let lastStreakDate = state.lastStreakDate

    // Check if it's a new day and reset daily XP to 0
    if (state.lastActiveDate && state.lastActiveDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)
      
      // If last active was not yesterday, reset streak
      if (state.lastActiveDate !== yesterdayStr) {
        streakDays = 0
        lastStreakDate = null
      }
      
      // Reset daily XP to 0 for new day - this is the key fix
      dailyXp = 0
    }
    
    // Add to daily XP (can be negative for deductions)
    dailyXp = Math.max(0, dailyXp + amount) // Ensure daily XP doesn't go below 0
    
    // Check if daily threshold is reached and update streak
    if (dailyXp >= dailyGoal) {
      if (streakDays === 0) {
        // Starting new streak
        streakDays = 1
        lastStreakDate = today
      } else if (lastStreakDate !== today) {
        // Continuing streak on new day
        streakDays += 1
        lastStreakDate = today
      }
      // If lastStreakDate === today, don't change streak (already counted today)
    }

    const newXpData = { 
      xp, 
      level: 1, // Always level 1
      dailyXp, 
      streakDays, 
      lastActiveDate: today,
      lastStreakDate 
    }

    try {
      // Save to Firebase
      await state.firebaseService.updateXpData(newXpData)
      
      // Update local state
      set({ 
        ...state,
        ...newXpData
      })
    } catch (error) {
      console.error('Error updating XP data:', error)
    }
  },

  touchStreak: () => {
    // This method is now handled in awardXp
    // Keeping for backward compatibility but it won't do anything
    return
  },

  resetStreak: async () => {
    const state = get()
    if (!state.firebaseService) {
      console.error('Firebase service not available for streak reset')
      return
    }

    const newXpData = { 
      ...state,
      streakDays: 0, 
      lastStreakDate: null,
      dailyXp: 0 
    }

    try {
      await state.firebaseService.updateXpData(newXpData)
      set(newXpData)
    } catch (error) {
      console.error('Error resetting streak:', error)
    }
  },

  // Method to reset daily XP (called on new day)
  resetDailyXp: async () => {
    const state = get()
    if (!state.firebaseService) {
      console.error('Firebase service not available for daily XP reset')
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const newXpData = { 
      ...state,
      dailyXp: 0,
      lastActiveDate: today
    }

    try {
      await state.firebaseService.updateXpData(newXpData)
      set(newXpData)
    } catch (error) {
      console.error('Error resetting daily XP:', error)
    }
  },

  // Method to check and reset if new day
  checkAndResetDaily: async () => {
    const state = get()
    if (!state.firebaseService) {
      // Firebase service not yet initialized, will retry when available
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    
    // If it's a new day, reset daily XP
    if (state.lastActiveDate && state.lastActiveDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)
      
      let streakDays = state.streakDays
      let lastStreakDate = state.lastStreakDate
      
      // If last active was not yesterday, reset streak
      if (state.lastActiveDate !== yesterdayStr) {
        streakDays = 0
        lastStreakDate = null
      }
      
      const newXpData = { 
        xp: state.xp,
        level: state.level,
        dailyXp: 0, // Reset daily XP to 0
        streakDays,
        lastStreakDate,
        lastActiveDate: today
      }

      try {
        await state.firebaseService.updateXpData(newXpData)
        set({ ...state, ...newXpData })
      } catch (error) {
        console.error('Error resetting daily XP:', error)
      }
    }
  },

  getDailyProgress: (dailyGoal = DEFAULT_DAILY_GOAL) => {
    const state = get()
    
    // Silently check and reset daily if Firebase service is available
    if (state.firebaseService) {
      get().checkAndResetDaily().catch(() => {
        // Silently handle errors to prevent UI disruption
      })
    }
    
    return {
      dailyXp: state.dailyXp || 0,
      threshold: dailyGoal,
      progress: Math.min(((state.dailyXp || 0) / dailyGoal) * 100, 100),
      isThresholdReached: (state.dailyXp || 0) >= dailyGoal
    }
  },

  // Clear XP data (for logout)
  clearXpData: () => {
    set(getDefaultXpState())
  }
}))


