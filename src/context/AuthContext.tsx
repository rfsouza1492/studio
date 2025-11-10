
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AuthError, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase'; // Renamed import to avoid conflict
import { useRouter } from 'next/navigation';
import { Target } from 'lucide-react';

interface AuthContextType {
  user: any | null;
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
  const [googleApiToken, setGoogleApiToken] = useState<string | null>(null);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // Handle redirect result after Google login
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (!auth || hasCheckedRedirect) return;
      
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setGoogleApiToken(credential.accessToken);
          }
          console.log("Login successful, user:", result.user?.email);
          // User will be available via onAuthStateChanged, which will trigger re-render
        }
      } catch (error: any) {
        console.error("Error getting redirect result:", error);
        // Don't throw - let onAuthStateChanged handle the state
      } finally {
        setHasCheckedRedirect(true);
      }
    };
    
    if (auth) {
      handleRedirectResult();
    }
  }, [auth, hasCheckedRedirect]);

  // Redirect to home after successful login
  useEffect(() => {
    if (!isUserLoading && user && router) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login') {
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setGoogleApiToken(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = { user, loading: isUserLoading, signInWithGoogle, signOut, googleApiToken };

  // Show loading only during initial auth check
  // After redirect, onAuthStateChanged will update user state
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
