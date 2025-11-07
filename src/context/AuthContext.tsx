
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signOut as firebaseSignOut,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This is the signed-in user
          setUser(result.user);
          router.push('/'); // Redirect to home page after login
        }
      })
      .catch((error) => {
        console.error("Error from redirect result:", error);
      })
      .finally(() => {
        setLoading(false);
      });


    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google redirect:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // O onAuthStateChanged tratará a atualização do usuário para null
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };

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
