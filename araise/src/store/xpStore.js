import { create } from 'zustand'

const persistKey = 'focus:xp'
const DAILY_XP_THRESHOLD = 60 // 60 minutes of focus = 60 XP minimum for streak

function load() {
  try {
    const raw = localStorage.getItem(persistKey)
    if (!raw) return { 
      xp: 0, 
      level: 1, 
      streakDays: 0, 
      lastActiveDate: null, 
      dailyXp: 0,
      lastStreakDate: null 
    }
    return JSON.parse(raw)
  } catch {
    return { 
      xp: 0, 
      level: 1, 
      streakDays: 0, 
      lastActiveDate: null, 
      dailyXp: 0,
      lastStreakDate: null 
    }
  }
}

function save(state) {
  try { localStorage.setItem(persistKey, JSON.stringify(state)) } catch {}
}

export const useXpStore = create((set, get) => ({
  ...load(),

  awardXp: (amount) => {
    set((state) => {
      const today = new Date().toISOString().slice(0, 10)
      let xp = state.xp + amount
      let dailyXp = state.dailyXp
      let streakDays = state.streakDays
      let lastStreakDate = state.lastStreakDate

      // Check if it's a new day and reset streak if needed
      if (state.lastActiveDate && state.lastActiveDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)
        
        // If last active was not yesterday, reset streak
        if (state.lastActiveDate !== yesterdayStr) {
          streakDays = 0
          lastStreakDate = null
        }
        
        // Reset daily XP for new day
        dailyXp = 0
      }
      
      // Add to daily XP
      dailyXp += amount
      
      // Check if daily threshold is reached and update streak
      if (dailyXp >= DAILY_XP_THRESHOLD) {
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

  getDailyProgress: () => {
    const state = get()
    // If user missed one or more full days since lastActiveDate, reset streak to 0.
    const todayStr = new Date().toISOString().slice(0, 10)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    if (state.lastActiveDate && state.lastActiveDate !== todayStr && state.lastActiveDate !== yesterdayStr && state.streakDays !== 0) {
      const next = { ...state, streakDays: 0 }
      save(next)
      set(next)
      return {
        dailyXp: next.dailyXp,
        threshold: DAILY_XP_THRESHOLD,
        progress: Math.min((next.dailyXp / DAILY_XP_THRESHOLD) * 100, 100),
        isThresholdReached: next.dailyXp >= DAILY_XP_THRESHOLD
      }
    }
    return {
      dailyXp: state.dailyXp,
      threshold: DAILY_XP_THRESHOLD,
      progress: Math.min((state.dailyXp / DAILY_XP_THRESHOLD) * 100, 100),
      isThresholdReached: state.dailyXp >= DAILY_XP_THRESHOLD
    }
  }
}))


