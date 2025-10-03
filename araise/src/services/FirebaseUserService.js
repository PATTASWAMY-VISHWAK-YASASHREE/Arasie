import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export class FirebaseUserService {
  constructor(userId) {
    this.userId = userId;
    this.userRef = doc(db, 'users', userId);
    // Expose Firebase functions for direct access
    this.updateDoc = updateDoc;
    this.serverTimestamp = serverTimestamp;
  }

  // Load user progress from Firestore
  async loadUserProgress() {
    try {
      const userDoc = await getDoc(this.userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          level: data.level || 1,
          streakCount: data.streakCount || 0,
          calendar: data.calendar || [],
          waterProgress: data.waterProgress || 0,
          waterGoal: data.waterGoal || 3000,
          dietCalories: data.dietCalories || 0,
          workoutCompleted: data.workoutCompleted || false,
          waterGoalMet: data.waterGoalMet || false,
          dietGoalMet: data.dietGoalMet || false,
          mentalHealthProgress: data.mentalHealthProgress || 0,
          focusProgress: data.focusProgress || 0,
          meals: data.meals || [],
          waterLogs: data.waterLogs || [],
          workoutHistory: data.workoutHistory || [],
          customWorkouts: data.customWorkouts || [],
          mentalHealthLogs: data.mentalHealthLogs || [],
          focusLogs: data.focusLogs || [],
          focusTasks: data.focusTasks || [],
          journalEntries: data.journalEntries || [],
          lastReset: data.lastReset || null
        };
      }
      return this.getDefaultProgress();
    } catch (error) {
      console.error('Error loading user progress:', error);
      return this.getDefaultProgress();
    }
  }

  // Get default progress structure
  getDefaultProgress() {
    return {
      level: 1,
      streakCount: 0,
      calendar: [],
      waterProgress: 0,
      waterGoal: 3000,
      dietCalories: 0,
      workoutCompleted: false,
      waterGoalMet: false,
      dietGoalMet: false,
      mentalHealthProgress: 0,
      focusProgress: 0,
      meals: [],
      waterLogs: [],
      workoutHistory: [],
      customWorkouts: [],
      mentalHealthLogs: [],
      focusLogs: [],
      focusTasks: [], // Custom focus tasks
      lastReset: null
    };
  }

  // Save complete user progress to Firestore
  async saveUserProgress(progressData) {
    try {
      await updateDoc(this.userRef, {
        ...progressData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  }

  // Update specific progress field
  async updateProgress(field, value) {
    try {
      await updateDoc(this.userRef, {
        [field]: value,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating progress field:', error);
      throw error;
    }
  }

  // Log water intake
  async logWater(amount, currentProgress, waterGoal, currentLogs) {
    const newProgress = currentProgress + amount;
    const waterGoalMet = newProgress >= waterGoal;
    const newLog = {
      id: Date.now(),
      amount,
      time: new Date().toISOString()
    };

    const updates = {
      waterProgress: newProgress,
      waterGoalMet,
      waterLogs: [...currentLogs, newLog],
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newProgress, waterGoalMet, newLog };
  }

  // Log meal
  async logMeal(meal, currentMeals, currentCalories) {
    const newMeal = {
      id: Date.now(),
      ...meal,
      time: new Date().toISOString()
    };
    const newCalories = currentCalories + meal.calories;
    const dietGoalMet = currentMeals.length + 1 >= 3; // 3 meals minimum

    const updates = {
      dietCalories: newCalories,
      dietGoalMet,
      meals: [...currentMeals, newMeal],
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newMeal, newCalories, dietGoalMet };
  }

  // Save workout session with real exercise data
  async saveWorkoutSession(workoutSessionData, currentHistory) {
    if (!workoutSessionData || !workoutSessionData.exercises || workoutSessionData.exercises.length === 0) {
      return { newHistory: currentHistory };
    }

    const today = new Date().toISOString().slice(0, 10);
    const planName = workoutSessionData.planName || "Workout Session";

    // Check if workout already exists for today with same plan
    const existingWorkout = currentHistory.find(workout => 
      workout.date === today && workout.planName === planName
    );

    if (existingWorkout) {
      return { newHistory: currentHistory };
    }

    // Create workout object with real session data - clean undefined values
    const workout = {
      id: Date.now(),
      type: workoutSessionData.type || "split",
      planName: planName,
      date: today,
      duration: workoutSessionData.duration || 30,
      completed: true,
      
      // Real exercise data with actual performance
      exercises: workoutSessionData.exercises.map(exercise => ({
        exerciseName: exercise.exerciseName || "Exercise",
        sets: exercise.completedSets || exercise.sets || 3,
        reps: exercise.completedReps || exercise.reps || 12,
        weight: exercise.actualWeight || exercise.weight || 0,
        completed: exercise.completed !== false
      })),
      
      // Session summary
      totalExercises: workoutSessionData.exercises.length,
      completedExercises: workoutSessionData.exercises.filter(ex => ex.completed !== false).length,
      totalSets: workoutSessionData.exercises.reduce((sum, ex) => sum + (ex.completedSets || ex.sets || 0), 0)
    };

    // Add optional fields only if they have values (not undefined)
    if (workoutSessionData.planId) workout.planId = workoutSessionData.planId;
    if (workoutSessionData.dayId) workout.dayId = workoutSessionData.dayId;
    if (workoutSessionData.startTime) workout.startTime = workoutSessionData.startTime;
    if (workoutSessionData.endTime) workout.endTime = workoutSessionData.endTime;
    if (workoutSessionData.totalVolume) workout.totalVolume = workoutSessionData.totalVolume;
    if (workoutSessionData.totalDistance) workout.totalDistance = workoutSessionData.totalDistance;
    if (workoutSessionData.totalCalories) workout.totalCalories = workoutSessionData.totalCalories;
    if (workoutSessionData.avgHeartRate) workout.avgHeartRate = workoutSessionData.avgHeartRate;

    const newHistory = [...currentHistory, workout];

    const updates = {
      workoutCompleted: true,
      workoutHistory: newHistory,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newHistory };
  }

  // Clean up duplicate workouts and fix data structure
  async cleanupWorkoutHistory(currentHistory) {
    // Remove duplicates and fix old data format
    const cleanedHistory = [];
    const seenWorkouts = new Set();

    for (const workout of currentHistory) {
      // Create a unique key for the workout
      const workoutKey = `${workout.date}_${workout.planName || workout.name}_${workout.planId || workout.splitId}`;
      
      // Skip if we've already seen this workout
      if (seenWorkouts.has(workoutKey)) {
        continue;
      }
      
      // Fix old data format
      const cleanedWorkout = {
        id: workout.id || Date.now(),
        type: workout.type || "split",
        planName: workout.planName || workout.name || `${workout.splitId} - ${workout.dayId}`,
        planId: workout.planId || workout.splitId,
        dayId: workout.dayId,
        date: workout.date,
        duration: workout.duration || 30,
        exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
        completed: true
      };

      // Only add if it has valid data
      if (cleanedWorkout.date && cleanedWorkout.planName) {
        cleanedHistory.push(cleanedWorkout);
        seenWorkouts.add(workoutKey);
      }
    }

    // Update Firebase with cleaned data
    const updates = {
      workoutHistory: cleanedHistory,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { cleanedHistory };
  }

  // Save cardio workout
  async saveCardioWorkout(cardioData, currentHistory) {
    const workout = {
      id: Date.now(),
      type: "cardio",
      planName: cardioData.name || "Cardio Session",
      
      date: new Date().toISOString().slice(0, 10),
      duration: cardioData.duration || 30,
      
      exercises: cardioData.exercises || [{
        exerciseName: cardioData.exerciseType || "Cardio",
        duration: cardioData.duration,
        distance: cardioData.distance,
        speed: cardioData.speed,
        calories: cardioData.calories
      }],
      
      totalDistance: cardioData.distance,
      totalCalories: cardioData.calories,
      avgHeartRate: cardioData.heartRate,
      
      completed: true
    };

    const newHistory = [...currentHistory, workout];

    const updates = {
      workoutCompleted: true,
      workoutHistory: newHistory,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newHistory };
  }

  // Add streak
  async addStreak(date, currentStreak, currentCalendar, currentLevel) {
    const newStreak = currentStreak + 1;
    const newCalendar = [...currentCalendar, { date, completed: true }];

    // Level up every 30 streak days
    const newLevel = newStreak % 30 === 0 ? currentLevel + 1 : currentLevel;

    const updates = {
      streakCount: newStreak,
      calendar: newCalendar,
      level: newLevel,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newStreak, newCalendar, newLevel };
  }

  // Reset streak to 0
  async resetStreak() {
    const updates = {
      streakCount: 0,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { streakCount: 0 };
  }

  // Archive current day data before reset
  async archiveDayData(date, data) {
    try {
      // Get existing daily archives
      const dailyArchives = data.dailyArchives || {};
      
      // Archive current day's data
      const dayArchive = {
        date,
        archived: new Date().toISOString(),
        activities: {
          water: (data.waterLogs || []).filter(log => {
            if (!log.time) return false;
            try {
              return new Date(log.time).toISOString().slice(0, 10) === date;
            } catch { return false; }
          }),
          meals: (data.meals || []).filter(meal => {
            if (!meal.time) return false;
            try {
              return new Date(meal.time).toISOString().slice(0, 10) === date;
            } catch { return false; }
          }),
          workouts: (data.workoutHistory || []).filter(workout => workout.date === date),
          focus: (data.focusTasks || []).filter(task => task.date === date),
          mentalWellness: (data.mentalHealthLogs || []).filter(log => {
            if (!log.time) return false;
            try {
              return new Date(log.time).toISOString().slice(0, 10) === date;
            } catch { return false; }
          })
        },
        progress: {
          waterProgress: data.waterProgress || 0,
          dietCalories: data.dietCalories || 0,
          focusProgress: data.focusProgress || 0,
          mentalHealthProgress: data.mentalHealthProgress || 0,
          workoutCompleted: data.workoutCompleted || false,
          waterGoalMet: data.waterGoalMet || false,
          dietGoalMet: data.dietGoalMet || false
        }
      };

      // Only archive if there's actual data
      const hasData = dayArchive.activities.water.length > 0 ||
                     dayArchive.activities.meals.length > 0 ||
                     dayArchive.activities.workouts.length > 0 ||
                     dayArchive.activities.focus.length > 0 ||
                     dayArchive.activities.mentalWellness.length > 0;

      if (hasData) {
        dailyArchives[date] = dayArchive;
        return dailyArchives;
      }

      return dailyArchives;
    } catch (error) {
      console.error('Error archiving day data:', error);
      return data.dailyArchives || {};
    }
  }

  // Reset daily progress with proper archiving
  async resetDaily() {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    try {
      const userDoc = await getDoc(this.userRef);
      if (!userDoc.exists()) return false;

      const data = userDoc.data();

      // Check if we already reset today
      if (data.lastReset === today) return false;

      // Archive yesterday's data before resetting
      const dailyArchives = await this.archiveDayData(yesterdayStr, data);

      // Clear current day data but keep historical archives
      const updates = {
        workoutCompleted: false,
        waterGoalMet: false,
        dietGoalMet: false,
        waterProgress: 0,
        dietCalories: 0,
        mentalHealthProgress: 0,
        focusProgress: 0,
        
        // Clear current day arrays but preserve in archives
        meals: [],
        waterLogs: [],
        mentalHealthLogs: [],
        focusLogs: [],
        
        // Keep focus tasks for today (they might be scheduled for today)
        focusTasks: (data.focusTasks || []).filter(task => task.date === today),
        
        // Update archives and reset info
        dailyArchives,
        lastReset: today,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(this.userRef, updates);
      return true;
    } catch (error) {
      console.error('Error resetting daily progress:', error);
      return false;
    }
  }

  // Custom Workout Methods

  // Save a new custom workout
  async saveCustomWorkout(workoutData, currentWorkouts) {
    const newWorkout = {
      id: Date.now(),
      ...workoutData,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    const updatedWorkouts = [...currentWorkouts, newWorkout];

    const updates = {
      customWorkouts: updatedWorkouts,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newWorkout, updatedWorkouts };
  }

  // Update an existing custom workout
  async updateCustomWorkout(workoutId, workoutData, currentWorkouts) {
    const updatedWorkouts = currentWorkouts.map(workout =>
      workout.id === workoutId
        ? { ...workout, ...workoutData, lastModified: new Date().toISOString() }
        : workout
    );

    const updates = {
      customWorkouts: updatedWorkouts,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedWorkouts };
  }

  // Delete a custom workout
  async deleteCustomWorkout(workoutId, currentWorkouts) {
    const updatedWorkouts = currentWorkouts.filter(workout => workout.id !== workoutId);

    const updates = {
      customWorkouts: updatedWorkouts,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedWorkouts };
  }

  // Get all custom workouts
  async getCustomWorkouts() {
    try {
      const userDoc = await getDoc(this.userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.customWorkouts || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading custom workouts:', error);
      return [];
    }
  }



  // Focus Methods

  // Log focus session
  async logFocusSession(duration, task, completed, currentLogs) {
    const newLog = {
      id: Date.now(),
      duration,
      task,
      completed,
      time: new Date().toISOString()
    };

    const updates = {
      focusLogs: [...currentLogs, newLog],
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newLog };
  }

  // Update focus progress
  async updateFocusProgress(percentage, currentProgress) {
    try {
      const newProgress = Math.min(currentProgress + percentage, 100);

      const updates = {
        focusProgress: newProgress,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(this.userRef, updates);
      return { newProgress };
    } catch (error) {
      console.error('Error updating focus progress:', error);
      throw error;
    }
  }

  // Save focus task
  async saveFocusTask(taskData, currentTasks) {
    const startDate = taskData.date || new Date().toISOString().slice(0, 10);
    const tasksToCreate = [];

    // Create the main task for the selected date
    const mainTask = {
      id: Date.now(),
      ...taskData,
      status: 'upcoming',
      completed: 0,
      date: startDate,
      created: new Date().toISOString(),
      isRepeating: taskData.repeat !== 'none',
      originalTaskId: null // This is the original task
    };

    tasksToCreate.push(mainTask);

    // Handle repeat functionality
    if (taskData.repeat === 'daily' || taskData.repeat === 'weekly') {
      const startDateObj = new Date(startDate);
      const endDate = taskData.repeatUntil ? new Date(taskData.repeatUntil) : null;
      const increment = taskData.repeat === 'daily' ? 1 : 7; // 1 day or 7 days
      let currentDate = new Date(startDateObj);
      currentDate.setDate(currentDate.getDate() + increment); // Start from next occurrence
      
      let dayCounter = 1;
      
      // Create repeated tasks until end date or reasonable limit
      while ((!endDate || currentDate <= endDate) && dayCounter <= 365) { // Max 1 year
        const futureDateStr = currentDate.toISOString().slice(0, 10);
        
        // Check if task already exists for this date
        const existingTask = currentTasks.find(task =>
          task.name === taskData.name &&
          task.date === futureDateStr &&
          task.originalTaskId === mainTask.id
        );

        if (!existingTask) {
          tasksToCreate.push({
            id: Date.now() + dayCounter, // Ensure unique IDs
            ...taskData,
            status: 'upcoming',
            completed: 0,
            date: futureDateStr,
            created: new Date().toISOString(),
            isRepeating: true,
            originalTaskId: mainTask.id
          });
        }
        
        // Move to next occurrence
        currentDate.setDate(currentDate.getDate() + increment);
        dayCounter++;
      }
    }

    const updatedTasks = [...currentTasks, ...tasksToCreate];

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newTask: mainTask, updatedTasks };
  }

  // Update an existing focus task
  async updateFocusTask(taskId, updatedTaskData, currentTasks) {
    const updatedTasks = currentTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updatedTaskData,
          id: taskId, // Preserve the original ID
          created: task.created, // Preserve creation date
          lastModified: new Date().toISOString()
        };
      }
      return task;
    });

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedTasks };
  }

  // Update focus task progress
  async updateFocusTaskProgress(taskId, minutesCompleted, currentTasks) {
    const updatedTasks = currentTasks.map(task => {
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

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedTasks };
  }

  // Delete focus task
  async deleteFocusTask(taskId, currentTasks) {
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedTasks };
  }

  // Delete entire series of repeated tasks
  async deleteFocusTaskSeries(taskId, currentTasks) {
    const taskToDelete = currentTasks.find(task => task.id === taskId);
    if (!taskToDelete) {
      throw new Error('Task not found');
    }

    // Find the original task ID (either this task or its parent)
    const originalTaskId = taskToDelete.originalTaskId || taskId;

    // Delete all tasks in the series (original + all repeats)
    const updatedTasks = currentTasks.filter(task => 
      task.id !== originalTaskId && task.originalTaskId !== originalTaskId
    );

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedTasks };
  }

  // Add reflection to focus task
  async addFocusTaskReflection(taskId, reflection, currentTasks) {
    const updatedTasks = currentTasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completionDescription: reflection.trim(),
          lastUpdated: new Date().toISOString()
        };
      }
      return task;
    });

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { updatedTasks };
  }

  // Get focus tasks
  async getFocusTasks() {
    try {
      const userDoc = await getDoc(this.userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const tasks = data.focusTasks || [];

        // Check and create missing repeated tasks
        const updatedTasks = await this.checkAndCreateRepeatedTasks(tasks);

        // If new tasks were created, save them
        if (updatedTasks.length > tasks.length) {
          await updateDoc(this.userRef, {
            focusTasks: updatedTasks,
            lastUpdated: serverTimestamp()
          });
        }

        return updatedTasks;
      }
      return [];
    } catch (error) {
      console.error('Error loading focus tasks:', error);
      return [];
    }
  }

  // Check and create missing repeated tasks
  async checkAndCreateRepeatedTasks(currentTasks) {
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
          tasksToAdd.push({
            id: Date.now() + Math.random() * 1000,
            ...originalTask,
            id: Date.now() + Math.random() * 1000, // New unique ID
            status: 'upcoming',
            completed: 0,
            date: today,
            created: new Date().toISOString(),
            isRepeating: true,
            originalTaskId: originalTask.id
          });
        }

        // Create future daily tasks (next 7 days)
        for (let i = 1; i <= 7; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          const futureDateStr = futureDate.toISOString().slice(0, 10);

          const futureTaskExists = currentTasks.some(task =>
            task.originalTaskId === originalTask.id && task.date === futureDateStr
          );

          if (!futureTaskExists) {
            tasksToAdd.push({
              id: Date.now() + Math.random() * 1000 + i,
              ...originalTask,
              id: Date.now() + Math.random() * 1000 + i, // New unique ID
              status: 'upcoming',
              completed: 0,
              date: futureDateStr,
              created: new Date().toISOString(),
              isRepeating: true,
              originalTaskId: originalTask.id
            });
          }
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
            tasksToAdd.push({
              id: Date.now() + Math.random() * 1000,
              ...originalTask,
              id: Date.now() + Math.random() * 1000, // New unique ID
              status: 'upcoming',
              completed: 0,
              date: today,
              created: new Date().toISOString(),
              isRepeating: true,
              originalTaskId: originalTask.id
            });
          }
        }

        // Create future weekly tasks (next 4 weeks, same day of week)
        for (let i = 1; i <= 4; i++) {
          const futureDate = new Date();
          const daysUntilTargetDay = (originalDayOfWeek - todayDayOfWeek + 7) % 7;
          futureDate.setDate(futureDate.getDate() + daysUntilTargetDay + (i * 7));
          const futureDateStr = futureDate.toISOString().slice(0, 10);

          const futureTaskExists = currentTasks.some(task =>
            task.originalTaskId === originalTask.id && task.date === futureDateStr
          );

          if (!futureTaskExists) {
            tasksToAdd.push({
              id: Date.now() + Math.random() * 1000 + (i * 1000),
              ...originalTask,
              id: Date.now() + Math.random() * 1000 + (i * 1000), // New unique ID
              status: 'upcoming',
              completed: 0,
              date: futureDateStr,
              created: new Date().toISOString(),
              isRepeating: true,
              originalTaskId: originalTask.id
            });
          }
        }
      }
    }

    return [...currentTasks, ...tasksToAdd];
  }



  // Journal Entry Methods
  async saveJournalEntry(entry) {
    try {
      const userDoc = await getDoc(this.userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentEntries = currentData.journalEntries || [];

      const updatedEntries = [entry, ...currentEntries];

      await updateDoc(this.userRef, {
        journalEntries: updatedEntries,
        lastUpdated: serverTimestamp()
      });

      return updatedEntries;
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  }

  async updateJournalEntry(entryId, updatedContent) {
    try {
      const userDoc = await getDoc(this.userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentEntries = currentData.journalEntries || [];

      const updatedEntries = currentEntries.map(entry =>
        entry.id === entryId
          ? { ...entry, content: updatedContent, lastModified: new Date().toISOString() }
          : entry
      );

      await updateDoc(this.userRef, {
        journalEntries: updatedEntries,
        lastUpdated: serverTimestamp()
      });

      return updatedEntries;
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }

  async deleteJournalEntry(entryId) {
    try {
      const userDoc = await getDoc(this.userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentEntries = currentData.journalEntries || [];

      const updatedEntries = currentEntries.filter(entry => entry.id !== entryId);

      await updateDoc(this.userRef, {
        journalEntries: updatedEntries,
        lastUpdated: serverTimestamp()
      });

      return updatedEntries;
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }



  // Add archived data directly to daily archives
  async addArchivedData(date, activities) {
    try {
      const userDoc = await getDoc(this.userRef);
      if (!userDoc.exists()) {
        console.error('User document does not exist');
        return;
      }

      const data = userDoc.data();
      const dailyArchives = data.dailyArchives || {};

      // Create archived day entry
      const dayArchive = {
        date,
        archived: new Date().toISOString(),
        activities: {
          water: activities.water || [],
          meals: activities.meals || [],
          workouts: activities.workouts || [],
          focus: activities.focus || [],
          mentalWellness: activities.mentalWellness || []
        },
        progress: {
          waterProgress: activities.water ? activities.water.reduce((sum, log) => sum + log.amount, 0) : 0,
          dietCalories: activities.meals ? activities.meals.reduce((sum, meal) => sum + meal.calories, 0) : 0,
          focusProgress: activities.focus ? Math.min((activities.focus.reduce((sum, task) => sum + (task.completed || 0), 0) / 60) * 100, 100) : 0,
          mentalHealthProgress: activities.mentalWellness ? 100 : 0,
          workoutCompleted: activities.workouts ? activities.workouts.length > 0 : false,
          waterGoalMet: activities.water ? activities.water.reduce((sum, log) => sum + log.amount, 0) >= 3000 : false,
          dietGoalMet: activities.meals ? activities.meals.reduce((sum, meal) => sum + meal.calories, 0) >= 2000 : false
        }
      };

      // Add to archives
      dailyArchives[date] = dayArchive;

      const updates = {
        dailyArchives,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(this.userRef, updates);
      console.log('✅ Archived data added for', date);
    } catch (error) {
      console.error('Error adding archived data:', error);
    }
  }

  // Get activities for a specific date (checks both current data and archives)
  async getActivitiesForDate(date) {
    try {
      const userDoc = await getDoc(this.userRef);
      if (!userDoc.exists()) {
        return {
          water: [],
          diet: [],
          workout: [],
          focus: [],
          mentalWellness: []
        };
      }

      const data = userDoc.data();
      const targetDate = new Date(date).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);

      // Check if we have archived data for this date
      const dailyArchives = data.dailyArchives || {};
      const archivedData = dailyArchives[targetDate];

      let activities = {
        water: [],
        diet: [],
        workout: [],
        focus: [],
        mentalWellness: []
      };

      // If we have archived data for this date, use it
      if (archivedData && archivedData.activities) {
        activities = {
          water: archivedData.activities.water || [],
          diet: archivedData.activities.meals || [],
          workout: archivedData.activities.workouts || [],
          focus: archivedData.activities.focus || [],
          mentalWellness: archivedData.activities.mentalWellness || []
        };
      } else if (targetDate === today) {
        // For today, get current data
        activities = {
          water: (data.waterLogs || []).filter(log => {
            if (!log.time) return false;
            try {
              const logDate = new Date(log.time).toISOString().slice(0, 10);
              return logDate === targetDate;
            } catch (error) {
              console.warn('Invalid water log time format:', log.time);
              return false;
            }
          }),
          diet: (data.meals || []).filter(meal => {
            if (!meal.time) return false;
            try {
              const mealDate = new Date(meal.time).toISOString().slice(0, 10);
              return mealDate === targetDate;
            } catch (error) {
              console.warn('Invalid meal time format:', meal.time);
              return false;
            }
          }),
          workout: (data.workoutHistory || []).filter(workout => {
            if (!workout.date) return false;
            return workout.date === targetDate;
          }),
          focus: (data.focusTasks || []).filter(task => {
            if (!task.date) return false;
            return task.date === targetDate;
          }),
          mentalWellness: (data.mentalHealthLogs || []).filter(log => {
            if (!log.time) return false;
            try {
              const logDate = new Date(log.time).toISOString().slice(0, 10);
              return logDate === targetDate;
            } catch (error) {
              console.warn('Invalid mental health log time format:', log.time);
              return false;
            }
          })
        };
      } else {
        // For past dates, also check current arrays (fallback for data not yet archived)
        activities = {
          water: (data.waterLogs || []).filter(log => {
            if (!log.time) return false;
            try {
              const logDate = new Date(log.time).toISOString().slice(0, 10);
              return logDate === targetDate;
            } catch (error) {
              return false;
            }
          }),
          diet: (data.meals || []).filter(meal => {
            if (!meal.time) return false;
            try {
              const mealDate = new Date(meal.time).toISOString().slice(0, 10);
              return mealDate === targetDate;
            } catch (error) {
              return false;
            }
          }),
          workout: (data.workoutHistory || []).filter(workout => {
            if (!workout.date) return false;
            return workout.date === targetDate;
          }),
          focus: (data.focusTasks || []).filter(task => {
            if (!task.date) return false;
            return task.date === targetDate;
          }),
          mentalWellness: (data.mentalHealthLogs || []).filter(log => {
            if (!log.time) return false;
            try {
              const logDate = new Date(log.time).toISOString().slice(0, 10);
              return logDate === targetDate;
            } catch (error) {
              return false;
            }
          })
        };
      }

      return activities;
    } catch (error) {
      console.error('Error getting activities for date:', error);
      return {
        water: [],
        diet: [],
        workout: [],
        focus: [],
        mentalWellness: []
      };
    }
  }

  // Real-time listener for user progress updates
  subscribeToUserProgress(callback) {
    return onSnapshot(this.userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          focusLogs: data.focusLogs || [],
          focusTasks: data.focusTasks || [],
          focusProgress: data.focusProgress || 0,
          mentalHealthProgress: data.mentalHealthProgress || 0,
          waterProgress: data.waterProgress || 0,
          dietCalories: data.dietCalories || 0,
          workoutCompleted: data.workoutCompleted || false,
          waterGoalMet: data.waterGoalMet || false,
          dietGoalMet: data.dietGoalMet || false,
          meals: data.meals || [],
          waterLogs: data.waterLogs || [],
          mentalHealthLogs: data.mentalHealthLogs || [],
          workoutHistory: data.workoutHistory || [],
          customWorkouts: data.customWorkouts || [],
          journalEntries: data.journalEntries || [],
          level: data.level || 1,
          streakCount: data.streakCount || 0,
          calendar: data.calendar || []
        });
      }
    }, (error) => {
      console.error('Error listening to user progress updates:', error);
    });
  }

  // Mental Health Activity Logging
  async updateMentalHealthProgress(newProgress) {
    try {
      await updateDoc(this.userRef, {
        mentalHealthProgress: newProgress,
        lastUpdated: serverTimestamp()
      });
      return { newProgress };
    } catch (error) {
      console.error('Error updating mental health progress:', error);
      throw error;
    }
  }

  async logMentalHealthActivity(activityLog, currentLogs) {
    try {
      const updatedLogs = [...currentLogs, activityLog];

      await updateDoc(this.userRef, {
        mentalHealthLogs: updatedLogs,
        lastUpdated: serverTimestamp()
      });

      return { updatedLogs };
    } catch (error) {
      console.error('Error logging mental health activity:', error);
      throw error;
    }
  }


}