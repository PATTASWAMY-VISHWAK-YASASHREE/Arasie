import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set, get) => ({
      // User profile
      name: 'Guest',
      level: 1,
      
      // Gamification
      streakCount: 0,
      calendar: [], // [{ date: 'YYYY-MM-DD', completed: true }]
      
      // Daily progress
      waterProgress: 0, // ml
      waterGoal: 3000, // 3L daily goal
      dietCalories: 0,
      workoutCompleted: false,
      waterGoalMet: false,
      dietGoalMet: false,
      
      // Logs and history
      meals: [], // [{ id, name, calories, time, macros }]
      waterLogs: [], // [{ id, amount, time }]
      workoutHistory: [], // [{ id, date, planId, exercises, duration }]
      
      // User actions
      updateName: (name) => set({ name }),
      updateLevel: (level) => set({ level }),
      
      // Streak management
      addStreak: (date) => set(state => ({
        streakCount: state.streakCount + 1,
        calendar: [...state.calendar, { date, completed: true }]
      })),
      
      // Daily reset (call this at midnight or app start for new day)
      resetDaily: () => {
        const today = new Date().toISOString().slice(0, 10)
        const state = get()
        
        // Check if we already reset today
        const lastReset = localStorage.getItem('lastReset')
        if (lastReset === today) return
        
        set({
          workoutCompleted: false,
          waterGoalMet: false,
          dietGoalMet: false,
          waterProgress: 0,
          dietCalories: 0,
          meals: [],
          waterLogs: [],
        })
        
        localStorage.setItem('lastReset', today)
      },
      
      // Water tracking
      logWater: (amount) => set(state => {
        const newProgress = state.waterProgress + amount
        const waterGoalMet = newProgress >= state.waterGoal
        const newLog = {
          id: Date.now(),
          amount,
          time: new Date().toISOString()
        }
        
        return {
          waterProgress: newProgress,
          waterGoalMet,
          waterLogs: [...state.waterLogs, newLog]
        }
      }),
      
      // Diet tracking
      logMeal: (meal) => set(state => {
        const newMeal = {
          id: Date.now(),
          ...meal,
          time: new Date().toISOString()
        }
        const newCalories = state.dietCalories + meal.calories
        const dietGoalMet = state.meals.length + 1 >= 3 // 3 meals minimum
        
        return {
          dietCalories: newCalories,
          dietGoalMet,
          meals: [...state.meals, newMeal]
        }
      }),
      
      // Workout tracking
      setWorkoutCompleted: (workoutData = null) => set(state => {
        const newHistory = workoutData ? [...state.workoutHistory, {
          id: Date.now(),
          ...workoutData,
          date: new Date().toISOString().slice(0, 10)
        }] : state.workoutHistory
        
        return {
          workoutCompleted: true,
          workoutHistory: newHistory
        }
      }),
      
      // Streak logic - check if all daily goals are met
      checkStreak: () => {
        const state = get()
        if (state.workoutCompleted && state.waterGoalMet && state.dietGoalMet) {
          const today = new Date().toISOString().slice(0, 10)
          // Only add streak if not already added today
          if (!state.calendar.find(c => c.date === today && c.completed)) {
            get().addStreak(today)
            
            // Level up every 30 streak days
            if ((state.streakCount + 1) % 30 === 0) {
              set({ level: state.level + 1 })
            }
          }
        }
      },
      
      // Get streak statistics
      getStreakStats: () => {
        const state = get()
        const currentStreak = state.streakCount
        const totalCompletedDays = state.calendar.filter(c => c.completed).length
        const thisWeek = state.calendar.filter(c => {
          const date = new Date(c.date)
          const today = new Date()
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
          return date >= weekStart && c.completed
        }).length
        
        return {
          currentStreak,
          totalCompletedDays,
          thisWeek
        }
      },
      
      // Get progress percentages for dashboard
      getProgressStats: () => {
        const state = get()
        return {
          workout: state.workoutCompleted ? 100 : 0,
          water: Math.min((state.waterProgress / state.waterGoal) * 100, 100),
          diet: state.dietGoalMet ? 100 : Math.min((state.meals.length / 3) * 100, 100)
        }
      },
    }),
    {
      name: 'araise-user-store',
      // Only persist certain fields
      partialize: (state) => ({
        name: state.name,
        level: state.level,
        streakCount: state.streakCount,
        calendar: state.calendar,
        workoutHistory: state.workoutHistory,
      }),
    }
  )
)

// Initialize daily reset on store creation
useUserStore.getState().resetDaily()
