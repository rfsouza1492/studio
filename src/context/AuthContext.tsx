
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase'; // Renamed import to avoid conflict
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  googleApiToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [googleApiToken, setGoogleApiToken] = useState<string | null>(null);

  // When user auth state changes, handle redirects. This is the single source of truth for redirection.
  useEffect(() => {
    if (isUserLoading) return; // Wait until auth state is confirmed

    // If user is NOT logged in and is NOT on the login page, redirect to login.
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
    
    // If user IS logged in and IS on the login page, redirect to home.
    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isUserLoading, pathname, router]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    // Request access to the user's calendar
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    try {
      // Use signInWithPopup for a more reliable and user-friendly flow
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleApiToken(credential.accessToken);
      }
      // After successful login, the useEffect hook above will handle the redirect.
    } catch (error) {
      // Handle specific Firebase Auth errors
      const authError = error as AuthError;
      
      // User closed the popup - this is not an error, just user cancellation
      if (authError.code === 'auth/popup-closed-by-user') {
        // Silently return - user intentionally cancelled
        if (process.env.NODE_ENV === 'development') {
          console.log("Login cancelled by user");
        }
        return;
      }
      
      // User blocked popup
      if (authError.code === 'auth/popup-blocked') {
        // Let the UI handle this with a friendly message
        throw new Error('Popup bloqueado. Por favor, permita popups para este site.');
      }
      
      // Network errors
      if (authError.code === 'auth/network-request-failed') {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      
      // Other errors - log in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing in with Google:", error);
      }
      
      // Re-throw with friendly message for unexpected errors
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      setGoogleApiToken(null);
      // After sign out, the useEffect hook will handle redirecting to the login page.
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = { user, loading: isUserLoading, signInWithGoogle, signOut, googleApiToken };

  // The loading state is now directly from useUser, which is managed by the FirebaseProvider
  // The PrivateRoute component will show a loading indicator while `isUserLoading` is true.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
