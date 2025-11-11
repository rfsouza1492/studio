'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase initialized via App Hosting environment variables');
      }
    } catch (e) {
      // Fallback to manual config
      if (!firebaseConfig.apiKey) {
        // Always log errors for missing apiKey (critical)
        console.error('Firebase config missing apiKey! Check environment variables.');
        throw new Error('Firebase configuration is missing apiKey. Please check NEXT_PUBLIC_FIREBASE_API_KEY environment variable.');
      }
      
      firebaseApp = initializeApp(firebaseConfig);
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Firebase initialized via firebaseConfig fallback');
      }
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  const auth = getAuth(firebaseApp);
  setPersistence(auth, browserLocalPersistence);
  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
