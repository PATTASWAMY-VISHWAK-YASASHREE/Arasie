import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing Firebase connection...');
  const [authStatus, setAuthStatus] = useState('Not authenticated');

  useEffect(() => {
    // Test Firebase connection
    const testFirebase = async () => {
      try {
        // Test auth initialization
        if (auth) {
          setStatus('✅ Firebase Auth initialized');
        } else {
          setStatus('❌ Firebase Auth failed to initialize');
          return;
        }

        // Test Firestore initialization
        if (db) {
          setStatus(prev => prev + '\n✅ Firestore initialized');
        } else {
          setStatus(prev => prev + '\n❌ Firestore failed to initialize');
        }

        // Test auth state listener
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setAuthStatus(`✅ Authenticated as: ${user.email}`);
          } else {
            setAuthStatus('❌ Not authenticated');
          }
        });

        return unsubscribe;
      } catch (error) {
        setStatus(`❌ Firebase connection error: ${error.message}`);
        return null;
      }
    };

    let unsubscribePromise = testFirebase();
    
    return () => {
      if (unsubscribePromise && typeof unsubscribePromise.then === 'function') {
        unsubscribePromise.then(unsubscribe => {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
      } else if (typeof unsubscribePromise === 'function') {
        unsubscribePromise();
      }
    };
  }, []);

  const testGoogleSignIn = async () => {
    try {
      setStatus(prev => prev + '\n🔄 Testing Google Sign In...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setStatus(prev => prev + `\n✅ Google Sign In successful: ${result.user.email}`);
    } catch (error) {
      setStatus(prev => prev + `\n❌ Google Sign In failed: ${error.code} - ${error.message}`);
      console.error('Google Sign In Error:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid black', 
      padding: '10px',
      maxWidth: '300px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Firebase Debug</h4>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{status}</pre>
      <p>{authStatus}</p>
      <button onClick={testGoogleSignIn} style={{ marginTop: '10px' }}>
        Test Google Sign In
      </button>
    </div>
  );
};

export default FirebaseTest;
