import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FirebaseUserService } from '../services/FirebaseUserService'

export const useUserStore = create(
  persist(
    (set, get) => ({
      // User profile & authentication
      user: null, // Firebase user object
      name: null, // Will be set when authenticated
      level: 1,
      isAuthenticated: false,
      email: null,
      firebaseService: null, // Will be set when user logs in
      
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
      mentalHealthProgress: 0, // 0-100 percentage
      focusProgress: 0, // 0-100 percentage
      
      // Logs and history
      meals: [], // [{ id, name, calories, time, macros }]
      waterLogs: [], // [{ id, amount, time }]
      workoutHistory: [], // [{ id, date, planId, exercises, duration }]
      mentalHealthLogs: [], // [{ id, mood, journalEntry, time }]
      focusLogs: [], // [{ id, duration, task, completed, time }]
      customWorkouts: [], // [{ id, name, goal, exercises, created, lastModified }]
      migrationCompleted: 0, // Number of workouts migrated on last login
      
      // User actions
      updateName: (name) => set({ name }),
      updateLevel: (level) => set({ level }),
      
      // Initialize authentication state
      initializeAuth: () => set({
        user: null,
        isAuthenticated: false,
        firebaseService: null,
        name: 'Guest', // This should never be seen by users since they'll be redirected
        waterProgress: 0,
        dietCalories: 0,
        workoutCompleted: false,
        waterGoalMet: false,
        dietGoalMet: false,
        mentalHealthProgress: 0,
        focusProgress: 0,
        meals: [],
        waterLogs: [],
        mentalHealthLogs: [],
        focusLogs: [],
        level: 1,
        streakCount: 0,
        calendar: [],
        workoutHistory: []
      }),
      
      // Authentication methods - updated to work with Firebase
      setUser: async (user) => {
        const firebaseService = user ? new FirebaseUserService(user.uid) : null;
        
        set({ 
          user,
          isAuthenticated: !!user,
          email: user?.email || null,
          name: user?.displayName || user?.email?.split('@')[0] || 'Guest',
          firebaseService
        });

        // Load user progress from Firebase when user logs in
        if (firebaseService) {
          try {
            const progress = await firebaseService.loadUserProgress();
            set(progress);
            
            // Migrate localStorage workouts to Firebase
            try {
              const migrationResult = await firebaseService.migrateLocalStorageWorkouts();
              if (migrationResult.migrated > 0) {
                console.log(`✅ Successfully migrated ${migrationResult.migrated} workouts to Firebase`);
                // Update the store with the migrated workouts
                set({ customWorkouts: migrationResult.workouts });
                
                // Set migration notification flag (could be used for UI notification)
                set({ migrationCompleted: migrationResult.migrated });
              } else {
                console.log('ℹ️ No workouts to migrate or migration already completed');
              }
            } catch (migrationError) {
              console.error('❌ Error migrating workouts:', migrationError);
              // Keep workouts in localStorage if migration fails
            }
            
            // Also reset daily progress if needed
            await firebaseService.resetDaily();
          } catch (error) {
            console.error('Error loading user progress:', error);
          }
        }
      },
      
      logout: () => set({ 
        user: null,
        isAuthenticated: false, 
        email: null, 
        name: null, // Clear name completely
        firebaseService: null,
        // Reset daily progress on logout
        waterProgress: 0,
        dietCalories: 0,
        workoutCompleted: false,
        waterGoalMet: false,
        dietGoalMet: false,
        mentalHealthProgress: 0,
        focusProgress: 0,
        meals: [],
        waterLogs: [],
        mentalHealthLogs: [],
        focusLogs: [],
        level: 1,
        streakCount: 0,
        calendar: [],
        workoutHistory: [],
        customWorkouts: [],
        migrationCompleted: 0
      }),
      
      // Streak management
      addStreak: async (date) => {
        const state = get();
        if (!state.firebaseService) return;

        try {
          const { newStreak, newCalendar, newLevel } = await state.firebaseService.addStreak(
            date, 
            state.streakCount, 
            state.calendar, 
            state.level
          );
          
          set({
            streakCount: newStreak,
            calendar: newCalendar,
            level: newLevel
          });
        } catch (error) {
          console.error('Error adding streak:', error);
        }
      },
      
      // Daily reset (call this at midnight or app start for new day)
      resetDaily: async () => {
        const state = get();
        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const today = new Date().toISOString().slice(0, 10);
          const lastReset = localStorage.getItem('lastReset');
          if (lastReset === today) return;
          
          set({
            workoutCompleted: false,
            waterGoalMet: false,
            dietGoalMet: false,
            waterProgress: 0,
            dietCalories: 0,
            mentalHealthProgress: 0,
            focusProgress: 0,
            meals: [],
            waterLogs: [],
            mentalHealthLogs: [],
            focusLogs: [],
          });
          
          localStorage.setItem('lastReset', today);
          return;
        }

        try {
          const wasReset = await state.firebaseService.resetDaily();
          if (wasReset) {
            set({
              workoutCompleted: false,
              waterGoalMet: false,
              dietGoalMet: false,
              waterProgress: 0,
              dietCalories: 0,
              mentalHealthProgress: 0,
              focusProgress: 0,
              meals: [],
              waterLogs: [],
              mentalHealthLogs: [],
              focusLogs: [],
            });
          }
        } catch (error) {
          console.error('Error resetting daily progress:', error);
        }
      },
      
      // Water tracking
      logWater: async (amount) => {
        const state = get();
        if (!state.firebaseService) {
          // Fallback for non-authenticated users
          const newProgress = state.waterProgress + amount;
          const waterGoalMet = newProgress >= state.waterGoal;
          const newLog = {
            id: Date.now(),
            amount,
            time: new Date().toISOString()
          };
          
          set({
            waterProgress: newProgress,
            waterGoalMet,
            waterLogs: [...state.waterLogs, newLog]
          });
          return;
        }

        try {
          const { newProgress, waterGoalMet, newLog } = await state.firebaseService.logWater(
            amount,
            state.waterProgress,
            state.waterGoal,
            state.waterLogs
          );
          
          set({
            waterProgress: newProgress,
            waterGoalMet,
            waterLogs: [...state.waterLogs, newLog]
          });
        } catch (error) {
          console.error('Error logging water:', error);
        }
      },
      
      // Diet tracking
      logMeal: async (meal) => {
        const state = get();
        if (!state.firebaseService) {
          // Fallback for non-authenticated users
          const newMeal = {
            id: Date.now(),
            ...meal,
            time: new Date().toISOString()
          };
          const newCalories = state.dietCalories + meal.calories;
          const dietGoalMet = state.meals.length + 1 >= 3; // 3 meals minimum
          
          set({
            dietCalories: newCalories,
            dietGoalMet,
            meals: [...state.meals, newMeal]
          });
          return;
        }

        try {
          const { newMeal, newCalories, dietGoalMet } = await state.firebaseService.logMeal(
            meal,
            state.meals,
            state.dietCalories
          );
          
          set({
            dietCalories: newCalories,
            dietGoalMet,
            meals: [...state.meals, newMeal]
          });
        } catch (error) {
          console.error('Error logging meal:', error);
        }
      },
      
      // Workout tracking
      setWorkoutCompleted: async (workoutData = null) => {
        const state = get();
        if (!state.firebaseService) {
          // Fallback for non-authenticated users
          const newHistory = workoutData ? [...state.workoutHistory, {
            id: Date.now(),
            ...workoutData,
            date: new Date().toISOString().slice(0, 10)
          }] : state.workoutHistory;
          
          set({
            workoutCompleted: true,
            workoutHistory: newHistory
          });
          return;
        }

        try {
          const { newHistory } = await state.firebaseService.setWorkoutCompleted(
            workoutData,
            state.workoutHistory
          );
          
          set({
            workoutCompleted: true,
            workoutHistory: newHistory
          });
        } catch (error) {
          console.error('Error setting workout completed:', error);
        }
      },
      
      // Streak logic - check if all daily goals are met
      checkStreak: async () => {
        const state = get();
        if (state.workoutCompleted && state.waterGoalMet && state.dietGoalMet) {
          const today = new Date().toISOString().slice(0, 10);
          // Only add streak if not already added today
          if (!state.calendar.find(c => c.date === today && c.completed)) {
            await get().addStreak(today);
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
          diet: state.dietGoalMet ? 100 : Math.min((state.meals.length / 3) * 100, 100),
          mentalHealth: state.mentalHealthProgress,
          focus: state.focusProgress
        }
      },

      // Mental Health tracking
      updateMentalHealthProgress: (percentage) => {
        set({ mentalHealthProgress: Math.min(percentage, 100) })
      },

      logMentalHealthEntry: (mood, journalEntry = '') => {
        const state = get()
        const newLog = {
          id: Date.now(),
          mood,
          journalEntry,
          time: new Date().toISOString()
        }
        set({
          mentalHealthLogs: [...state.mentalHealthLogs, newLog]
        })
      },

      // Focus tracking
      updateFocusProgress: (percentage) => {
        set({ focusProgress: Math.min(percentage, 100) })
      },

      logFocusSession: (duration, task, completed = true) => {
        const state = get()
        const newLog = {
          id: Date.now(),
          duration,
          task,
          completed,
          time: new Date().toISOString()
        }
        set({
          focusLogs: [...state.focusLogs, newLog]
        })
      },

      // Update water progress (simplified method)
      updateWaterProgress: (amount) => {
        const state = get()
        const newProgress = state.waterProgress + amount
        const waterGoalMet = newProgress >= state.waterGoal
        const newLog = {
          id: Date.now(),
          amount,
          time: new Date().toISOString()
        }
        
        set({
          waterProgress: newProgress,
          waterGoalMet,
          waterLogs: [...state.waterLogs, newLog]
        })
      },

      // Custom Workout Management
      saveCustomWorkout: async (workoutData) => {
        const state = get();
        
        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const newWorkout = {
            id: Date.now(),
            ...workoutData,
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };
          
          const savedWorkouts = JSON.parse(localStorage.getItem('customWorkouts') || '[]');
          const updatedWorkouts = [...savedWorkouts, newWorkout];
          localStorage.setItem('customWorkouts', JSON.stringify(updatedWorkouts));
          
          set({ customWorkouts: updatedWorkouts });
          return newWorkout;
        }

        try {
          const { newWorkout, updatedWorkouts } = await state.firebaseService.saveCustomWorkout(
            workoutData,
            state.customWorkouts
          );
          
          set({ customWorkouts: updatedWorkouts });
          return newWorkout;
        } catch (error) {
          console.error('Error saving custom workout:', error);
          throw error;
        }
      },

      updateCustomWorkout: async (workoutId, workoutData) => {
        const state = get();
        
        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedWorkouts = JSON.parse(localStorage.getItem('customWorkouts') || '[]');
          const updatedWorkouts = savedWorkouts.map(workout => 
            workout.id === workoutId 
              ? { ...workout, ...workoutData, lastModified: new Date().toISOString() }
              : workout
          );
          localStorage.setItem('customWorkouts', JSON.stringify(updatedWorkouts));
          
          set({ customWorkouts: updatedWorkouts });
          return updatedWorkouts;
        }

        try {
          const { updatedWorkouts } = await state.firebaseService.updateCustomWorkout(
            workoutId,
            workoutData,
            state.customWorkouts
          );
          
          set({ customWorkouts: updatedWorkouts });
          return updatedWorkouts;
        } catch (error) {
          console.error('Error updating custom workout:', error);
          throw error;
        }
      },

      deleteCustomWorkout: async (workoutId) => {
        const state = get();
        
        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedWorkouts = JSON.parse(localStorage.getItem('customWorkouts') || '[]');
          const updatedWorkouts = savedWorkouts.filter(workout => workout.id !== workoutId);
          localStorage.setItem('customWorkouts', JSON.stringify(updatedWorkouts));
          
          set({ customWorkouts: updatedWorkouts });
          return updatedWorkouts;
        }

        try {
          const { updatedWorkouts } = await state.firebaseService.deleteCustomWorkout(
            workoutId,
            state.customWorkouts
          );
          
          set({ customWorkouts: updatedWorkouts });
          return updatedWorkouts;
        } catch (error) {
          console.error('Error deleting custom workout:', error);
          throw error;
        }
      },

      loadCustomWorkouts: async () => {
        const state = get();
        
        if (!state.firebaseService) {
          // Load from localStorage for non-authenticated users
          const savedWorkouts = JSON.parse(localStorage.getItem('customWorkouts') || '[]');
          set({ customWorkouts: savedWorkouts });
          return savedWorkouts;
        }

        try {
          const workouts = await state.firebaseService.getCustomWorkouts();
          set({ customWorkouts: workouts });
          return workouts;
        } catch (error) {
          console.error('Error loading custom workouts:', error);
          return [];
        }
      },
    }),
    {
      name: 'araise-user-store',
      // Don't persist authentication state - let Firebase handle it
      partialize: (state) => ({
        // Only persist non-sensitive data that doesn't affect authentication
        email: state.email,
        name: state.name
      }),
    }
  )
)

// Initialize daily reset on store creation (only for authenticated users)
const initializeDailyReset = async () => {
  const state = useUserStore.getState();
  if (state.isAuthenticated) {
    await state.resetDaily();
  }
};

initializeDailyReset();
