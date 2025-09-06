import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
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
}
