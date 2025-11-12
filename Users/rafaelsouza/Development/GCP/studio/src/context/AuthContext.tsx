
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, AuthError } from 'firebase/auth';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase'; // Renamed import to avoid conflict
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  googleApiToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading, userError } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [googleApiToken, setGoogleApiToken] = useState<string | null>(null);
  const { toast } = useToast();

  // When user auth state changes, handle redirects.
  useEffect(() => {
    if (isUserLoading) return; // Wait until auth state is confirmed

    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
    
    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isUserLoading, pathname, router]);

  // If there's an authentication error from the provider, log it.
  useEffect(() => {
    if (userError) {
      console.error("Firebase Auth Error:", userError);
      // Optionally, you could show a toast here for critical auth errors
    }
  }, [userError]);


  const signInWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleApiToken(credential.accessToken);
      }
    } catch (error) {
      const authError = error as AuthError;
      
      if (authError.code === 'auth/popup-closed-by-user') {
        if (process.env.NODE_ENV === 'development') {
          console.log("Login cancelled by user");
        }
        return;
      }
      
      if (authError.code === 'auth/popup-blocked') {
        throw new Error('Popup bloqueado. Por favor, permita popups para este site e tente novamente.');
      }
      
      if (authError.code === 'auth/network-request-failed') {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing in with Google:", error);
      }
      
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      setGoogleApiToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = { user, loading: isUserLoading, signInWithGoogle, signOut, googleApiToken };

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
