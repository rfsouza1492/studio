
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, AuthError, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
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
  const [authIsLoading, setAuthIsLoading] = useState(true);

  // Combina o carregamento do hook useUser com o nosso próprio estado de carregamento
  const loading = isUserLoading || authIsLoading;

  useEffect(() => {
    const handleRedirectResult = async () => {
      if (!auth) return;
      
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setGoogleApiToken(credential.accessToken);
          }
          // Redireciona para a home após o login bem-sucedido via redirect
          if (pathname === '/login') {
            router.replace('/');
          }
        }
      } catch (error) {
        console.error("Error getting redirect result:", error);
      } finally {
        setAuthIsLoading(false);
      }
    };
    
    handleRedirectResult();
  }, [auth, pathname, router]);

  const signInWithGoogle = async () => {
    if (!auth) return;
    setAuthIsLoading(true);
    const provider = new GoogleAuthProvider();
    // Adiciona o escopo da API do Google Calendar para obter permissão
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setAuthIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await auth.signOut();
      setGoogleApiToken(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut, googleApiToken };

  if (loading) {
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
