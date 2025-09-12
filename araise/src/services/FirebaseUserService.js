import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
          meals: data.meals || [],
          waterLogs: data.waterLogs || [],
          workoutHistory: data.workoutHistory || [],
          customWorkouts: data.customWorkouts || [],
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
      meals: [],
      waterLogs: [],
      workoutHistory: [],
      customWorkouts: [],
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
        meals: [],
        waterLogs: [],
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
}
