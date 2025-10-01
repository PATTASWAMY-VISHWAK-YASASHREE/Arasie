import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FirebaseUserService } from '../services/FirebaseUserService'
import { useXpStore } from './xpStore'

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


      // Real-time subscription
      unsubscribeFromUpdates: null,

      // UI state
      isChatOpen: false,

      // Workout session state
      currentWorkoutSession: null,
      workoutStartTime: null,

      // User actions
      updateName: (name) => set({ name }),
      updateLevel: (level) => set({ level }),

      // UI actions
      setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),



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

            // Set up real-time listener for updates
            const unsubscribe = firebaseService.subscribeToUserProgress((updates) => {
              set(updates);
            });
            set({ unsubscribeFromUpdates: unsubscribe });

            // Reset daily progress if needed
            await firebaseService.resetDaily();

            // Check for missed days and reset streak if necessary
            await get().checkAndResetStreakForMissedDays();

            // Update focus progress based on completed tasks
            await get().updateFocusProgress();
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
          customWorkouts: []
        });
      },

      // Streak management
      addStreak: async (date) => {
        const state = get();
        if (!state.firebaseService) {
          console.error('Firebase service not available');
          return;
        }

        try {
          // First check if we should reset streak before adding
          await get().checkAndResetStreakForMissedDays();

          // Get updated state after potential reset
          const updatedState = get();

          const { newStreak, newCalendar, newLevel } = await state.firebaseService.addStreak(
            date,
            updatedState.streakCount,
            updatedState.calendar,
            updatedState.level
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

        // Check for missed days and reset streak if necessary
        await get().checkAndResetStreakForMissedDays();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
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
          console.error('Firebase service not available');
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
          console.error('Firebase service not available');
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
      // Save workout session with real exercise data
      saveWorkoutSession: async (workoutSessionData) => {
        const state = get();

        if (!state.firebaseService) {
          return;
        }

        try {
          // Check if the function exists
          if (!state.firebaseService.saveWorkoutSession) {
            // Fallback to old method with new data structure
            const legacyData = {
              type: workoutSessionData.type,
              planName: workoutSessionData.planName,
              planId: workoutSessionData.planId,
              dayId: workoutSessionData.dayId,
              duration: workoutSessionData.duration,
              exercises: workoutSessionData.exercises
            };

            const { newHistory } = await state.firebaseService.setWorkoutCompleted(
              legacyData,
              state.workoutHistory
            );

            set({
              workoutCompleted: true,
              workoutHistory: newHistory
            });
            return;
          }

          const { newHistory } = await state.firebaseService.saveWorkoutSession(
            workoutSessionData,
            state.workoutHistory
          );

          set({
            workoutCompleted: true,
            workoutHistory: newHistory
          });
        } catch (error) {
          // Error saving workout session
        }
      },



      // Start workout session
      startWorkoutSession: (workoutPlan) => {
        const session = {
          id: Date.now(),
          planName: workoutPlan.planName,
          planId: workoutPlan.planId,
          dayId: workoutPlan.dayId,
          type: workoutPlan.type || "split",
          startTime: new Date().toISOString(),
          exercises: workoutPlan.exercises.map(exercise => ({
            ...exercise,
            completed: false,
            completedSets: 0,
            completedReps: [],
            actualWeight: [],
            notes: ""
          }))
        };

        set({
          currentWorkoutSession: session,
          workoutStartTime: new Date().toISOString()
        });

        console.log('Workout session started:', session);
        return session;
      },

      // Update exercise in current session
      updateExerciseInSession: (exerciseIndex, updates) => {
        const state = get();
        if (!state.currentWorkoutSession) return;

        const updatedSession = {
          ...state.currentWorkoutSession,
          exercises: state.currentWorkoutSession.exercises.map((exercise, index) =>
            index === exerciseIndex ? { ...exercise, ...updates } : exercise
          )
        };

        set({ currentWorkoutSession: updatedSession });
      },

      // Complete workout session
      completeWorkoutSession: async () => {
        const state = get();
        if (!state.currentWorkoutSession) return;

        const endTime = new Date().toISOString();
        const startTime = new Date(state.workoutStartTime);
        const duration = Math.round((new Date(endTime) - startTime) / (1000 * 60)); // minutes

        const sessionData = {
          ...state.currentWorkoutSession,
          endTime,
          duration,
          totalVolume: state.currentWorkoutSession.exercises.reduce((sum, exercise) => {
            const weight = Array.isArray(exercise.actualWeight)
              ? exercise.actualWeight.reduce((a, b) => a + b, 0)
              : exercise.actualWeight || 0;
            const reps = Array.isArray(exercise.completedReps)
              ? exercise.completedReps.reduce((a, b) => a + b, 0)
              : exercise.completedReps || 0;
            return sum + (weight * reps);
          }, 0)
        };

        await state.saveWorkoutSession(sessionData);

        // Clear session
        set({
          currentWorkoutSession: null,
          workoutStartTime: null
        });

        return sessionData;
      },

      // Cancel workout session
      cancelWorkoutSession: () => {
        set({
          currentWorkoutSession: null,
          workoutStartTime: null
        });
      },









      // Save cardio workout
      saveCardioWorkout: async (cardioData) => {
        const state = get();
        if (!state.firebaseService) {
          return;
        }

        try {
          const { newHistory } = await state.firebaseService.saveCardioWorkout(
            cardioData,
            state.workoutHistory
          );

          set({
            workoutCompleted: true,
            workoutHistory: newHistory
          });
        } catch (error) {
          // Silent error handling - could be logged to external service
        }
      },

      // Streak logic - check if all daily goals are met
      checkStreak: async () => {
        const state = get();

        // First, check for missed days and reset streak if necessary
        await get().checkAndResetStreakForMissedDays();

        // Check if focus goal is met (60+ minutes or 100% progress)
        const focusGoalMet = state.focusProgress >= 100;

        if (state.workoutCompleted && state.waterGoalMet && state.dietGoalMet && focusGoalMet) {
          const today = new Date().toISOString().slice(0, 10);
          // Only add streak if not already added today
          if (!state.calendar.find(c => c.date === today && c.completed)) {
            await get().addStreak(today);
          }
        }
      },

      // Get XP and focus stats
      getXpStats: () => {
        const xpState = useXpStore.getState();
        const dailyProgress = xpState.getDailyProgress();

        return {
          totalXp: xpState.xp,
          level: xpState.level,
          streakDays: xpState.streakDays,
          dailyXp: dailyProgress.dailyXp,
          dailyThreshold: dailyProgress.threshold,
          dailyProgress: dailyProgress.progress,
          isThresholdReached: dailyProgress.isThresholdReached
        };
      },

      // Check for missed days and reset streak if necessary
      checkAndResetStreakForMissedDays: async () => {
        const state = get();
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        // If no streak, nothing to check
        if (state.streakCount === 0) {
          return;
        }

        // If no calendar entries, reset streak
        if (state.calendar.length === 0) {
          await get().resetStreak();
          return;
        }

        // Find the most recent completed day
        const completedDays = state.calendar
          .filter(c => c.completed)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        // If no completed days but we have a streak, reset it
        if (completedDays.length === 0) {
          await get().resetStreak();
          return;
        }

        const lastCompletedDate = new Date(completedDays[0].date);
        const daysDifference = Math.floor((today - lastCompletedDate) / (1000 * 60 * 60 * 24));

        // If more than 1 day has passed since last completion, reset streak
        // Allow for same day (0 days) and yesterday (1 day), but reset if 2+ days
        if (daysDifference > 1) {
          await get().resetStreak();
        }
      },

      // Reset streak to 0
      resetStreak: async () => {
        const state = get();
        if (!state.firebaseService) {
          console.error('Firebase service not available');
          return;
        }

        try {
          await state.firebaseService.resetStreak();
          set({ streakCount: 0 });
        } catch (error) {
          console.error('Error resetting streak:', error);
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
          console.error('Firebase service not available');
          return;
        }

        try {
          await state.firebaseService.updateMentalHealthProgress(newProgress);
          set({ mentalHealthProgress: newProgress });
        } catch (error) {
          console.error('Error updating mental health progress:', error);
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
          console.error('Firebase service not available');
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
          console.error('Firebase service not available');
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
          console.error('Firebase service not available');
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
        }
      },

      logMentalHealthEntry: async (mood, journalEntry = '') => {
        const state = get()
        const newLog = {
          id: Date.now(),
          type: 'mood_check',
          mood,
          journalEntry,
          time: new Date().toISOString()
        }

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          return;
        }

        try {
          const { updatedLogs } = await state.firebaseService.logMentalHealthActivity(
            newLog,
            state.mentalHealthLogs
          );
          set({ mentalHealthLogs: updatedLogs });
        } catch (error) {
          console.error('Error logging mental health entry:', error);
        }
      },

      // Focus tracking
      updateFocusProgress: async (percentage) => {
        const state = get();
        if (!state.firebaseService) {
          console.error('Firebase service not available');
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
          console.error('Firebase service not available');
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



      // Custom Workout Management
      saveCustomWorkout: async (workoutData) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          return [];
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
          console.error('Firebase service not available');
          return [];
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



      // Focus Task Management
      saveFocusTask: async (taskData) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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

      updateFocusTask: async (taskId, updatedTaskData) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
        }

        try {
          const { updatedTasks } = await state.firebaseService.updateFocusTask(
            taskId,
            updatedTaskData,
            state.focusTasks
          );

          set({ focusTasks: updatedTasks });
          return { success: true, updatedTasks };
        } catch (error) {
          console.error('Error updating focus task:', error);
          throw error;
        }
      },

      updateFocusTaskProgress: async (taskId, minutesCompleted) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
        }

        try {
          // Find the task before updating to check previous status
          const taskBefore = state.focusTasks.find(task => task.id === taskId);
          const wasCompleted = taskBefore?.status === 'completed';

          const { updatedTasks } = await state.firebaseService.updateFocusTaskProgress(
            taskId,
            minutesCompleted,
            state.focusTasks
          );

          // Find the updated task to check new status
          const taskAfter = updatedTasks.find(task => task.id === taskId);
          const isNowCompleted = taskAfter?.status === 'completed';

          // Award XP when task is completed (not when uncompleted)
          if (!wasCompleted && isNowCompleted && minutesCompleted > 0) {
            // Award XP based on minutes completed (1 XP per minute)
            const xpToAward = Math.max(1, minutesCompleted); // Minimum 1 XP
            useXpStore.getState().awardXp(xpToAward);

            // Update focus progress
            await get().updateFocusProgress();
          } else if (wasCompleted && !isNowCompleted) {
            // Deduct XP when task is uncompleted
            const xpToDeduct = -(taskBefore.completed || taskBefore.planned || 25);
            useXpStore.getState().awardXp(xpToDeduct);

            // Update focus progress
            await get().updateFocusProgress();
          }

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        } catch (error) {
          console.error('Error updating focus task progress:', error);
          throw error;
        }
      },

      // Update focus progress based on completed tasks
      updateFocusProgress: async () => {
        const state = get();
        const today = new Date().toISOString().slice(0, 10);

        // Get today's completed focus tasks
        const todaysCompletedTasks = state.focusTasks.filter(task =>
          task.date === today && task.status === 'completed'
        );

        // Calculate total minutes completed today
        const totalMinutesCompleted = todaysCompletedTasks.reduce((total, task) => {
          return total + (task.completed || task.planned || 25);
        }, 0);

        // Calculate progress percentage (60 minutes = 100%)
        const progressPercentage = Math.min((totalMinutesCompleted / 60) * 100, 100);

        // Update focus progress
        if (state.firebaseService) {
          try {
            await state.firebaseService.updateFocusProgress(progressPercentage, 0);
            set({ focusProgress: progressPercentage });
          } catch (error) {
            console.error('Error updating focus progress:', error);
          }
        }
      },

      deleteFocusTask: async (taskId) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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

      deleteFocusTaskSeries: async (taskId) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
        }

        try {
          const { updatedTasks } = await state.firebaseService.deleteFocusTaskSeries(
            taskId,
            state.focusTasks
          );

          set({ focusTasks: updatedTasks });
          return updatedTasks;
        } catch (error) {
          console.error('Error deleting focus task series:', error);
          throw error;
        }
      },

      addFocusTaskReflection: async (taskId, reflection) => {
        const state = get();

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          throw new Error('Authentication required');
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
          console.error('Firebase service not available');
          return [];
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





      logChatSession: async (summary, topics = []) => {
        const state = get();
        const newLog = {
          id: Date.now(),
          type: 'chat',
          activity: 'AI Assistant Chat',
          summary: summary,
          topics: topics,
          time: new Date().toISOString()
        };

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          return;
        }

        try {
          const { updatedLogs } = await state.firebaseService.logMentalHealthActivity(
            newLog,
            state.mentalHealthLogs
          );
          set({ mentalHealthLogs: updatedLogs });
        } catch (error) {
          console.error('Error logging chat session:', error);
        }
      },

      logJournalActivity: async (title, content, wordCount, mood = null) => {
        const state = get();
        const newLog = {
          id: Date.now(),
          type: 'journal',
          activity: 'Journal Entry',
          title: title,
          content: content,
          wordCount: wordCount,
          mood: mood,
          time: new Date().toISOString()
        };

        if (!state.firebaseService) {
          console.error('Firebase service not available');
          return;
        }

        try {
          const { updatedLogs } = await state.firebaseService.logMentalHealthActivity(
            newLog,
            state.mentalHealthLogs
          );
          set({ mentalHealthLogs: updatedLogs });
        } catch (error) {
          console.error('Error logging journal activity:', error);
        }
      },
    }),
    {
      name: 'araise-user-store',
      // Only persist minimal UI state - Firebase handles all data
      partialize: (state) => ({
        isChatOpen: state.isChatOpen
      }),
    }
  )
)


