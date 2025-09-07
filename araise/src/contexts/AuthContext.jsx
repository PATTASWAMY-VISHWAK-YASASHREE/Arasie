import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const { displayName, email } = user;
      const createdAt = serverTimestamp();

      try {
        await setDoc(userRef, {
          displayName,
          email,
          createdAt,
          level: 1,
          streakCount: 0,
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }

    return userRef;
  };

  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      await updateProfile(result.user, {
        displayName: displayName
      });

      // Create user profile in Firestore
      await createUserProfile(result.user, { displayName });

      return result;
    } catch (error) {
      // Handle signup errors appropriately
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Ensure user profile exists in Firestore (create if missing)
      await createUserProfile(result.user);
      
      return result;
    } catch (error) {
      // Let Firebase handle the error messages naturally
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email address. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      }
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      console.log('Attempting Google sign in...');
      
      // Try popup first, fallback to redirect if popup is blocked
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        console.warn('Popup blocked, trying redirect:', popupError);
        if (popupError.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, provider);
          return; // The redirect will handle the rest
        }
        throw popupError;
      }
      
      console.log('Google sign in successful:', result.user);

      // Create user profile in Firestore if it doesn't exist
      await createUserProfile(result.user);

      return result;
    } catch (error) {
      console.error('Detailed Google sign in error:', {
        code: error.code,
        message: error.message,
        customData: error.customData,
        stack: error.stack
      });
      throw error;
    }
  };

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Google sign in via redirect successful:', result.user);
          await createUserProfile(result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    
    handleRedirectResult();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user profile exists in Firestore
        await createUserProfile(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    googleSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
