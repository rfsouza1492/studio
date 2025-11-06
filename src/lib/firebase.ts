// Firebase SDK Configuration
// Using the modular SDK (v9+) for better tree-shaking and smaller bundle size

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALRps1FyfrS8P3SxTEhpU-0m3Mb58k_1w",
  authDomain: "magnetai-4h4a8.firebaseapp.com",
  projectId: "magnetai-4h4a8",
  storageBucket: "magnetai-4h4a8.firebasestorage.app",
  messagingSenderId: "210739580533",
  appId: "1:210739580533:web:90a7f1063949457ded723c"
};

// Initialize Firebase
// Only initialize if no apps exist (prevents duplicate initialization in Next.js)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Export the app instance for advanced use cases
export default app;

