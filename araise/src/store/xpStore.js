import { create } from 'zustand'

const persistKey = 'focus:xp'
const DEFAULT_DAILY_GOAL = 60 // Default 60 minutes of focus

function load() {
  try {
    const raw = localStorage.getItem(persistKey)
    if (!raw) return { 
      xp: 0, 
      level: 1, 
      streakDays: 0, 
      lastActiveDate: null, 
      dailyXp: 0,
      lastStreakDate: null,
      dailyGoal: DEFAULT_DAILY_GOAL
    }
    return JSON.parse(raw)
  } catch {
    return { 
      xp: 0, 
      level: 1, 
      streakDays: 0, 
      lastActiveDate: null, 
      dailyXp: 0,
      lastStreakDate: null,
      dailyGoal: DEFAULT_DAILY_GOAL
    }
  }
}

function save(state) {
  try { localStorage.setItem(persistKey, JSON.stringify(state)) } catch {}
}

export const useXpStore = create((set, get) => ({
  ...load(),

  // Set daily focus goal (in minutes)
  setDailyGoal: (minutes) => {
    set((state) => {
      const next = { 
        ...state, 
        dailyGoal: Math.max(15, Math.min(480, minutes)) // Min 15 minutes, max 8 hours
      }
      save(next)
      return next
    })
  },

  awardXp: (amount) => {
    set((state) => {
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
      const dailyGoal = state.dailyGoal || DEFAULT_DAILY_GOAL
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

      const next = { 
        ...state, 
        xp, 
        level: 1, // Always level 1
        dailyXp, 
        streakDays, 
        lastActiveDate: today,
        lastStreakDate 
      }
      save(next)
      return next
    })
  },

  touchStreak: () => {
    // This method is now handled in awardXp
    // Keeping for backward compatibility but it won't do anything
    return
  },

  resetStreak: () => {
    set((state) => {
      const next = { 
        ...state, 
        streakDays: 0, 
        lastStreakDate: null,
        dailyXp: 0 
      }
      save(next)
      return next
    })
  },

  // Method to reset daily XP (called on new day)
  resetDailyXp: () => {
    set((state) => {
      const today = new Date().toISOString().slice(0, 10)
      const next = { 
        ...state, 
        dailyXp: 0,
        lastActiveDate: today
      }
      save(next)
      return next
    })
  },

  // Method to check and reset if new day
  checkAndResetDaily: () => {
    const state = get()
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
      
      const next = { 
        ...state, 
        dailyXp: 0, // Reset daily XP to 0
        streakDays,
        lastStreakDate,
        lastActiveDate: today
      }
      save(next)
      set(next)
    }
  },

  getDailyProgress: () => {
    const state = get()
    // First check and reset if it's a new day
    get().checkAndResetDaily()
    
    // Get updated state after potential reset
    const updatedState = get()
    const dailyGoal = updatedState.dailyGoal || DEFAULT_DAILY_GOAL
    
    return {
      dailyXp: updatedState.dailyXp,
      threshold: dailyGoal,
      progress: Math.min((updatedState.dailyXp / dailyGoal) * 100, 100),
      isThresholdReached: updatedState.dailyXp >= dailyGoal
    }
  }
}))


