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
      focusTasks: [], // [{ id, name, planned, completed, status, date, created, breakType, customCycles, repeat }]
      customWorkouts: [], // [{ id, name, goal, exercises, created, lastModified }]
      journalEntries: [], // [{ id, content, date, mood, isAutoCreated, lastModified }]
      migrationCompleted: 0, // Number of workouts migrated on last login
      focusMigrationCompleted: 0, // Number of focus tasks migrated on last login

      // Real-time subscription
      unsubscribeFromUpdates: null,

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
        focusTasks: [],
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

            // Migrate localStorage focus tasks to Firebase
            try {
              const focusMigrationResult = await firebaseService.migrateLocalStorageFocusTasks();
              if (focusMigrationResult.migrated > 0) {
                console.log(`✅ Successfully migrated ${focusMigrationResult.migrated} focus tasks to Firebase`);
                // Update the store with the migrated tasks
                set({ focusTasks: focusMigrationResult.tasks });

                // Set migration notification flag
                set({ focusMigrationCompleted: focusMigrationResult.migrated });
              } else {
                console.log('ℹ️ No focus tasks to migrate or migration already completed');
              }
            } catch (focusMigrationError) {
              console.error('❌ Error migrating focus tasks:', focusMigrationError);
              // Keep tasks in localStorage if migration fails
            }

            // Migrate localStorage journal entries to Firebase
            try {
              const journalMigrationResult = await firebaseService.migrateLocalStorageJournalEntries();
              if (journalMigrationResult.migrated > 0) {
                console.log(`✅ Successfully migrated ${journalMigrationResult.migrated} journal entries to Firebase`);
                // Update the store with the migrated entries
                set({ journalEntries: journalMigrationResult.entries });
              } else {
                console.log('ℹ️ No journal entries to migrate or migration already completed');
              }
            } catch (journalMigrationError) {
              console.error('❌ Error migrating journal entries:', journalMigrationError);
              // Keep entries in localStorage if migration fails
            }

            // Set up real-time listener for updates
            const unsubscribe = firebaseService.subscribeToUserProgress((updates) => {
              set(updates);
            });
            set({ unsubscribeFromUpdates: unsubscribe });

            // Also reset daily progress if needed
            await firebaseService.resetDaily();
          } catch (error) {
            console.error('Error loading user progress:', error);
          }
        }
      },

      logout: () => {
        const state = get();
        
        // Unsubscribe from real-time updates
        if (state.unsubscribeFromUpdates) {
          state.unsubscribeFromUpdates();
        }
        
        set({
          user: null,
          isAuthenticated: false,
          email: null,
          name: null, // Clear name completely
          firebaseService: null,
          unsubscribeFromUpdates: null,
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
          focusTasks: [],
          level: 1,
          streakCount: 0,
          calendar: [],
          workoutHistory: [],
          customWorkouts: [],
          migrationCompleted: 0,
          focusMigrationCompleted: 0
        });
      },

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
            focusTasks: [],
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
              focusTasks: [],
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
          const weekStart = new Date(today.getTime()) // Create a copy to avoid mutation
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
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
      updateMentalHealthProgress: async (percentage) => {
        const state = get();
        const newProgress = Math.min(state.mentalHealthProgress + percentage, 100);
        
        if (!state.firebaseService) {
          set({ mentalHealthProgress: newProgress });
          return;
        }

        try {
          await state.firebaseService.updateMentalHealthProgress(newProgress);
          set({ mentalHealthProgress: newProgress });
        } catch (error) {
          console.error('Error updating mental health progress:', error);
          // Fallback to local update
          set({ mentalHealthProgress: newProgress });
        }
      },

      // Add specific mental health activity tracking
      logBreathingSession: async (exerciseName, duration) => {
        const state = get();
        const newLog = {
          id: Date.now(),
          type: 'breathing',
          activity: exerciseName,
          duration: duration,
          time: new Date().toISOString()
        };

        if (!state.firebaseService) {
          set({
            mentalHealthLogs: [...state.mentalHealthLogs, newLog]
          });
          return;
        }

        try {
          const { updatedLogs } = await state.firebaseService.logMentalHealthActivity(
            newLog,
            state.mentalHealthLogs
          );
          set({ mentalHealthLogs: updatedLogs });
        } catch (error) {
          console.error('Error logging breathing session:', error);
          // Fallback to local storage
          set({
            mentalHealthLogs: [...state.mentalHealthLogs, newLog]
          });
        }
      },

      logMeditationSession: async (meditationName, duration) => {
        const state = get();
        const newLog = {
          id: Date.now(),
          type: 'meditation',
          activity: meditationName,
          duration: duration,
          time: new Date().toISOString()
        };

        if (!state.firebaseService) {
          set({
            mentalHealthLogs: [...state.mentalHealthLogs, newLog]
          });
          return;
        }

        try {
          const { updatedLogs } = await state.firebaseService.logMentalHealthActivity(
            newLog,
            state.mentalHealthLogs
          );
          set({ mentalHealthLogs: updatedLogs });
        } catch (error) {
          console.error('Error logging meditation session:', error);
          set({
            mentalHealthLogs: [...state.mentalHealthLogs, newLog]
          });
        }
      },

      logSoundHealingSession: async (soundName, duration) => {
        const state = get();
        const newLog = {
          id: Date.now(),
          type: 'sound_healing',
          activity: soundName,
          duration: duration,
          time: new Date().toISOString()
        };

        if (!state.firebaseService) {
          set({
            mentalHealthLogs: [...state.mentalHealthLogs, newLog]
          });
          return;
        }

        try {
          const { updatedLogs } = await state.firebaseService.logMentalHealthActivity(
            newLog,
            state.mentalHealthLogs
          );
          set({ mentalHealthLogs: updatedLogs });
        } catch (error) {
          console.error('Error logging sound healing session:', error);
          set({
            mentalHealthLogs: [...state.mentalHealthLogs, newLog]
          });
        }
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
      updateFocusProgress: async (percentage) => {
        const state = get();
        if (!state.firebaseService) {
          set({ focusProgress: Math.min(percentage, 100) });
          return;
        }

        try {
          const { newProgress } = await state.firebaseService.updateFocusProgress(
            percentage,
            state.focusProgress
          );
          set({ focusProgress: newProgress });
        } catch (error) {
          console.error('Error updating focus progress:', error);
        }
      },

      logFocusSession: async (duration, task, completed = true) => {
        const state = get();
        if (!state.firebaseService) {
          const newLog = {
            id: Date.now(),
            duration,
            task,
            completed,
            time: new Date().toISOString()
          };
          set({
            focusLogs: [...state.focusLogs, newLog]
          });
          return;
        }

        try {
          const { newLog } = await state.firebaseService.logFocusSession(
            duration,
            task,
            completed,
            state.focusLogs
          );
          set({
            focusLogs: [...state.focusLogs, newLog]
          });
        } catch (error) {
          console.error('Error logging focus session:', error);
        }
      },

      // Update water progress (simplified method) - now saves to Firebase
      updateWaterProgress: async (amount) => {
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
          console.error('Error updating water progress:', error);
        }
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

      loadFocusTasks: async () => {
        const state = get();

        if (!state.firebaseService) {
          // Load from localStorage for non-authenticated users
          const savedTasks = JSON.parse(localStorage.getItem('focusCustomTasks') || '[]');
          
          // Check and create missing repeated tasks
          const updatedTasks = state.checkAndCreateRepeatedTasksLocal(savedTasks);
          
          // If new tasks were created, save them
          if (updatedTasks.length > savedTasks.length) {
            localStorage.setItem('focusCustomTasks', JSON.stringify(updatedTasks));
          }
          
          set({ focusTasks: updatedTasks });
          return updatedTasks;
        }

        try {
          const tasks = await state.firebaseService.getFocusTasks();
          set({ focusTasks: tasks });
          return tasks;
        } catch (error) {
          console.error('Error loading focus tasks:', error);
          return [];
        }
      },

      // Helper function for localStorage repeated tasks
      checkAndCreateRepeatedTasksLocal: (currentTasks) => {
        const today = new Date().toISOString().slice(0, 10);
        const tasksToAdd = [];

        // Find all original repeating tasks
        const originalRepeatingTasks = currentTasks.filter(task => 
          task.isRepeating && task.originalTaskId === null
        );

        for (const originalTask of originalRepeatingTasks) {
          if (originalTask.repeat === 'daily') {
            // Check if we need to create today's task
            const todayTaskExists = currentTasks.some(task => 
              task.originalTaskId === originalTask.id && task.date === today
            );

            if (!todayTaskExists && originalTask.date !== today) {
              const newId = Date.now() + Math.random() * 1000;
              tasksToAdd.push({
                ...originalTask,
                id: newId,
                status: 'upcoming',
                completed: 0,
                date: today,
                created: new Date().toISOString(),
                isRepeating: true,
                originalTaskId: originalTask.id
              });
            }
          } else if (originalTask.repeat === 'weekly') {
            // Get the day of week from original task
            const originalDate = new Date(originalTask.date);
            const originalDayOfWeek = originalDate.getDay();
            const todayDate = new Date();
            const todayDayOfWeek = todayDate.getDay();

            // Check if today matches the original day of week
            if (originalDayOfWeek === todayDayOfWeek) {
              const todayTaskExists = currentTasks.some(task => 
                task.originalTaskId === originalTask.id && task.date === today
              );

              if (!todayTaskExists && originalTask.date !== today) {
                const newId = Date.now() + Math.random() * 1000;
                tasksToAdd.push({
                  ...originalTask,
                  id: newId,
                  status: 'upcoming',
                  completed: 0,
                  date: today,
                  created: new Date().toISOString(),
                  isRepeating: true,
                  originalTaskId: originalTask.id
                });
              }
            }
          }
        }

        return [...currentTasks, ...tasksToAdd];
      },

      // Focus Task Management
      saveFocusTask: async (taskData) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const today = new Date().toISOString().slice(0, 10);
          const savedTasks = JSON.parse(localStorage.getItem('focusCustomTasks') || '[]');
          const tasksToCreate = [];

          // Create the main task for today
          const mainTask = {
            id: Date.now(),
            ...taskData,
            status: 'upcoming',
            completed: 0,
            date: today,
            created: new Date().toISOString(),
            isRepeating: taskData.repeat !== 'none',
            originalTaskId: null
          };

          tasksToCreate.push(mainTask);

          // Handle repeat functionality
          if (taskData.repeat === 'daily') {
            // Create tasks for the next 7 days
            for (let i = 1; i <= 7; i++) {
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + i);
              const futureDateStr = futureDate.toISOString().slice(0, 10);

              // Check if task already exists for this date
              const existingTask = savedTasks.find(task => 
                task.name === taskData.name && 
                task.date === futureDateStr &&
                task.originalTaskId === mainTask.id
              );

              if (!existingTask) {
                tasksToCreate.push({
                  id: Date.now() + i,
                  ...taskData,
                  status: 'upcoming',
                  completed: 0,
                  date: futureDateStr,
                  created: new Date().toISOString(),
                  isRepeating: true,
                  originalTaskId: mainTask.id
                });
              }
            }
          } else if (taskData.repeat === 'weekly') {
            // Create tasks for the next 4 weeks
            for (let i = 1; i <= 4; i++) {
              const futureDate = new Date();
              futureDate.setDate(futureDate.getDate() + (i * 7));
              const futureDateStr = futureDate.toISOString().slice(0, 10);

              // Check if task already exists for this date
              const existingTask = savedTasks.find(task => 
                task.name === taskData.name && 
                task.date === futureDateStr &&
                task.originalTaskId === mainTask.id
              );

              if (!existingTask) {
                tasksToCreate.push({
                  id: Date.now() + (i * 1000),
                  ...taskData,
                  status: 'upcoming',
                  completed: 0,
                  date: futureDateStr,
                  created: new Date().toISOString(),
                  isRepeating: true,
                  originalTaskId: mainTask.id
                });
              }
            }
          }

          const updatedTasks = [...savedTasks, ...tasksToCreate];
          localStorage.setItem('focusCustomTasks', JSON.stringify(updatedTasks));

          set({ focusTasks: updatedTasks });
          return mainTask;
        }

        try {
          const { newTask, updatedTasks } = await state.firebaseService.saveFocusTask(
            taskData,
            state.focusTasks
          );

          set({ focusTasks: updatedTasks });
          return newTask;
        } catch (error) {
          console.error('Error saving focus task:', error);
          throw error;
        }
      },

      updateFocusTaskProgress: async (taskId, minutesCompleted) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedTasks = JSON.parse(localStorage.getItem('focusCustomTasks') || '[]');
          const updatedTasks = savedTasks.map(task => {
            if (task.id === taskId) {
              const newCompleted = task.completed + minutesCompleted;
              const newStatus = newCompleted >= task.planned ? 'completed' : 'in-progress';
              return {
                ...task,
                completed: Math.min(newCompleted, task.planned),
                status: newStatus,
                lastUpdated: new Date().toISOString()
              };
            }
            return task;
          });
          localStorage.setItem('focusCustomTasks', JSON.stringify(updatedTasks));

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        }

        try {
          const { updatedTasks } = await state.firebaseService.updateFocusTaskProgress(
            taskId,
            minutesCompleted,
            state.focusTasks
          );

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        } catch (error) {
          console.error('Error updating focus task progress:', error);
          throw error;
        }
      },

      deleteFocusTask: async (taskId) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedTasks = JSON.parse(localStorage.getItem('focusCustomTasks') || '[]');
          const updatedTasks = savedTasks.filter(task => task.id !== taskId);
          localStorage.setItem('focusCustomTasks', JSON.stringify(updatedTasks));

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        }

        try {
          const { updatedTasks } = await state.firebaseService.deleteFocusTask(
            taskId,
            state.focusTasks
          );

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        } catch (error) {
          console.error('Error deleting focus task:', error);
          throw error;
        }
      },

      addFocusTaskReflection: async (taskId, reflection) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedTasks = JSON.parse(localStorage.getItem('focusCustomTasks') || '[]');
          const updatedTasks = savedTasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                completionDescription: reflection.trim(),
                lastUpdated: new Date().toISOString()
              };
            }
            return task;
          });
          localStorage.setItem('focusCustomTasks', JSON.stringify(updatedTasks));

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        }

        try {
          const { updatedTasks } = await state.firebaseService.addFocusTaskReflection(
            taskId,
            reflection,
            state.focusTasks
          );

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        } catch (error) {
          console.error('Error adding focus task reflection:', error);
          throw error;
        }
      },

      // Journal Entry Management
      saveJournalEntry: async (entry) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
          const updatedEntries = [entry, ...savedEntries];
          localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

          set({ journalEntries: updatedEntries });
          return updatedEntries;
        }

        try {
          const updatedEntries = await state.firebaseService.saveJournalEntry(entry);
          set({ journalEntries: updatedEntries });
          return updatedEntries;
        } catch (error) {
          console.error('Error saving journal entry:', error);
          throw error;
        }
      },

      updateJournalEntry: async (entryId, updatedContent) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
          const updatedEntries = savedEntries.map(entry => 
            entry.id === entryId 
              ? { ...entry, content: updatedContent, lastModified: new Date().toISOString() }
              : entry
          );
          localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

          set({ journalEntries: updatedEntries });
          return updatedEntries;
        }

        try {
          const updatedEntries = await state.firebaseService.updateJournalEntry(entryId, updatedContent);
          set({ journalEntries: updatedEntries });
          return updatedEntries;
        } catch (error) {
          console.error('Error updating journal entry:', error);
          throw error;
        }
      },

      deleteJournalEntry: async (entryId) => {
        const state = get();

        if (!state.firebaseService) {
          // Fallback to localStorage for non-authenticated users
          const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
          const updatedEntries = savedEntries.filter(entry => entry.id !== entryId);
          localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

          set({ journalEntries: updatedEntries });
          return updatedEntries;
        }

        try {
          const updatedEntries = await state.firebaseService.deleteJournalEntry(entryId);
          set({ journalEntries: updatedEntries });
          return updatedEntries;
        } catch (error) {
          console.error('Error deleting journal entry:', error);
          throw error;
        }
      },

      loadJournalEntries: async () => {
        const state = get();

        if (!state.firebaseService) {
          // Load from localStorage for non-authenticated users
          const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
          set({ journalEntries: savedEntries });
          return savedEntries;
        }

        try {
          const progress = await state.firebaseService.loadUserProgress();
          set({ journalEntries: progress.journalEntries || [] });
          return progress.journalEntries || [];
        } catch (error) {
          console.error('Error loading journal entries:', error);
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
