
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AuthError, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase'; // Renamed import to avoid conflict
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [googleApiToken, setGoogleApiToken] = useState<string | null>(null);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // Handle redirect result after Google login
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (!auth || hasCheckedRedirect) return;
      
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setGoogleApiToken(credential.accessToken);
          }
          
          // Immediately redirect to home after successful login
          // Don't wait for onAuthStateChanged - redirect right away
          if (pathname === '/login' || window.location.pathname === '/login') {
            router.replace('/');
            // Also use window.location as fallback
            window.location.href = '/';
          }
        } else {
          // No redirect result - check if user is already authenticated
          if (auth.currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
            router.replace('/');
            window.location.href = '/';
          }
        }
      } catch (error: any) {
        console.error("Error getting redirect result:", error);
        // Even on error, check if user is authenticated
        if (auth.currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
          router.replace('/');
          window.location.href = '/';
        }
      } finally {
        setHasCheckedRedirect(true);
      }
    };
    
    if (auth) {
      handleRedirectResult();
    }
  }, [auth, hasCheckedRedirect, pathname, router]);

  // Redirect to home after successful login (fallback check)
  useEffect(() => {
    // Check both user from hook and auth.currentUser (more reliable after redirect)
    const currentUser = user || (auth?.currentUser);
    
    if (!isUserLoading && currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
      router.replace('/');
      // Use window.location as backup to ensure redirect happens
      if (window.location.pathname === '/login') {
        window.location.href = '/';
      }
    }
  }, [user, isUserLoading, pathname, router, auth]);

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
