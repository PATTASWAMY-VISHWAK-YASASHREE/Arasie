import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export class FirebaseUserService {
  constructor(userId) {
    this.userId = userId;
    this.userRef = doc(db, 'users', userId);
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

  // Set workout completed
  async setWorkoutCompleted(workoutData, currentHistory) {
    const newHistory = workoutData ? [...currentHistory, {
      id: Date.now(),
      ...workoutData,
      date: new Date().toISOString().slice(0, 10)
    }] : currentHistory;

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

  // Reset daily progress
  async resetDaily() {
    const today = new Date().toISOString().slice(0, 10);

    try {
      const userDoc = await getDoc(this.userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();

        // Check if we already reset today
        if (data.lastReset === today) return false;
      }

      const updates = {
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

  // Migrate localStorage workouts to Firebase (one-time migration)
  async migrateLocalStorageWorkouts() {
    try {
      // Get workouts from localStorage
      const localWorkouts = JSON.parse(localStorage.getItem('customWorkouts') || '[]');

      if (localWorkouts.length === 0) {
        console.log('No localStorage workouts to migrate');
        return { migrated: 0 };
      }

      // Get current Firebase workouts
      const currentWorkouts = await this.getCustomWorkouts();

      // Check if migration already happened (avoid duplicates)
      const existingIds = new Set(currentWorkouts.map(w => w.id));
      const workoutsToMigrate = localWorkouts.filter(w => !existingIds.has(w.id));

      if (workoutsToMigrate.length === 0) {
        console.log('All localStorage workouts already migrated');
        return { migrated: 0 };
      }

      // Add migration metadata to workouts
      const migratedWorkouts = workoutsToMigrate.map(workout => ({
        ...workout,
        migrated: true,
        migratedAt: new Date().toISOString(),
        lastModified: workout.created || new Date().toISOString()
      }));

      // Merge with existing workouts
      const allWorkouts = [...currentWorkouts, ...migratedWorkouts];

      // Save to Firebase
      const updates = {
        customWorkouts: allWorkouts,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(this.userRef, updates);

      // Clear localStorage after successful migration
      localStorage.removeItem('customWorkouts');

      console.log(`Successfully migrated ${migratedWorkouts.length} workouts from localStorage to Firebase`);
      return { migrated: migratedWorkouts.length, workouts: allWorkouts };
    } catch (error) {
      console.error('Error migrating localStorage workouts:', error);
      throw error;
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
    const today = new Date().toISOString().slice(0, 10);
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
      originalTaskId: null // This is the original task
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
        const existingTask = currentTasks.find(task =>
          task.name === taskData.name &&
          task.date === futureDateStr &&
          task.originalTaskId === mainTask.id
        );

        if (!existingTask) {
          tasksToCreate.push({
            id: Date.now() + i, // Ensure unique IDs
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
      // Create tasks for the next 4 weeks (same day of week)
      for (let i = 1; i <= 4; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (i * 7));
        const futureDateStr = futureDate.toISOString().slice(0, 10);

        // Check if task already exists for this date
        const existingTask = currentTasks.find(task =>
          task.name === taskData.name &&
          task.date === futureDateStr &&
          task.originalTaskId === mainTask.id
        );

        if (!existingTask) {
          tasksToCreate.push({
            id: Date.now() + (i * 1000), // Ensure unique IDs
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

    const updatedTasks = [...currentTasks, ...tasksToCreate];

    const updates = {
      focusTasks: updatedTasks,
      lastUpdated: serverTimestamp()
    };

    await updateDoc(this.userRef, updates);
    return { newTask: mainTask, updatedTasks };
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

  // Migrate localStorage focus tasks to Firebase (one-time migration)
  async migrateLocalStorageFocusTasks() {
    try {
      // Get focus tasks from localStorage
      const localTasks = JSON.parse(localStorage.getItem('focusCustomTasks') || '[]');

      if (localTasks.length === 0) {
        console.log('No localStorage focus tasks to migrate');
        return { migrated: 0 };
      }

      // Get current Firebase focus tasks
      const currentTasks = await this.getFocusTasks();

      // Check if migration already happened (avoid duplicates)
      const existingIds = new Set(currentTasks.map(t => t.id));
      const tasksToMigrate = localTasks.filter(t => !existingIds.has(t.id));

      if (tasksToMigrate.length === 0) {
        console.log('All localStorage focus tasks already migrated');
        return { migrated: 0 };
      }

      // Add migration metadata to tasks
      const migratedTasks = tasksToMigrate.map(task => ({
        ...task,
        migrated: true,
        migratedAt: new Date().toISOString()
      }));

      // Merge with existing tasks
      const allTasks = [...currentTasks, ...migratedTasks];

      // Save to Firebase
      const updates = {
        focusTasks: allTasks,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(this.userRef, updates);

      // Clear localStorage after successful migration
      localStorage.removeItem('focusCustomTasks');

      console.log(`Successfully migrated ${migratedTasks.length} focus tasks from localStorage to Firebase`);
      return { migrated: migratedTasks.length, tasks: allTasks };
    } catch (error) {
      console.error('Error migrating localStorage focus tasks:', error);
      throw error;
    }
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

  // Migrate localStorage journal entries to Firebase (one-time migration)
  async migrateLocalStorageJournalEntries() {
    try {
      // Get journal entries from localStorage
      const localEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');

      if (localEntries.length === 0) {
        console.log('No localStorage journal entries to migrate');
        return { migrated: 0 };
      }

      // Get current entries from Firebase
      const userDoc = await getDoc(this.userRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const currentEntries = currentData.journalEntries || [];

      // Filter out entries that already exist in Firebase (by ID)
      const existingIds = new Set(currentEntries.map(entry => entry.id));
      const entriesToMigrate = localEntries.filter(entry => !existingIds.has(entry.id));

      if (entriesToMigrate.length === 0) {
        console.log('All localStorage journal entries already migrated');
        return { migrated: 0 };
      }

      // Merge with existing entries
      const allEntries = [...entriesToMigrate, ...currentEntries];

      const updates = {
        journalEntries: allEntries,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(this.userRef, updates);

      // Clear localStorage after successful migration
      localStorage.removeItem('journalEntries');

      console.log(`Successfully migrated ${entriesToMigrate.length} journal entries from localStorage to Firebase`);
      return { migrated: entriesToMigrate.length, entries: allEntries };
    } catch (error) {
      console.error('Error migrating localStorage journal entries:', error);
      throw error;
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