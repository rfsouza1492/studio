
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase'; // Renamed import to avoid conflict
import { useRouter, usePathname } from 'next/navigation';
import { Target } from 'lucide-react';

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

  // When user changes (login/logout), handle redirects
  useEffect(() => {
    if (isUserLoading) return; // Wait until auth state is confirmed

    // If user is logged in, redirect them away from the login page
    if (user && pathname === '/login') {
      router.replace('/');
    }
    // If user is not logged in, redirect them to the login page
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    try {
      // Use signInWithPopup for a more reliable and user-friendly flow
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleApiToken(credential.accessToken);
      }
      // Redirect to home page after successful login
      router.replace('/');
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Let user know something went wrong, but don't crash
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      setGoogleApiToken(null);
      // Redirect to login page after sign out
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = { user, loading: isUserLoading, signInWithGoogle, signOut, googleApiToken };

  // Show a loading screen while Firebase is determining the auth state
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Target className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

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
