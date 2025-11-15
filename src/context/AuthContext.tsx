
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, AuthError } from 'firebase/auth';
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
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [googleApiToken, setGoogleApiToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by tracking client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirect result after Google OAuth redirect
  useEffect(() => {
    if (!mounted || !auth) return;

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setGoogleApiToken(credential.accessToken);
          }
          // User will be set by onAuthStateChanged, redirect handled below
          
          // Show success toast
          toast({
            title: 'Login realizado com sucesso',
            description: 'Bem-vindo ao GoalFlow!',
          });
        }
      } catch (error) {
        const authError = error as AuthError;
        console.error("Error handling redirect result:", authError);
        
        // Map Firebase error codes to user-friendly messages
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        let errorTitle = 'Erro de Autenticação';
        
        if (authError.code === 'auth/account-exists-with-different-credential') {
          errorTitle = 'Conta já existe';
          errorMessage = 'Uma conta com este email já existe usando outro método de login.';
        } else if (authError.code === 'auth/invalid-credential') {
          errorTitle = 'Credenciais inválidas';
          errorMessage = 'As credenciais fornecidas são inválidas ou expiraram.';
        } else if (authError.code === 'auth/network-request-failed') {
          errorTitle = 'Erro de Conexão';
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua internet.';
        } else if (authError.code === 'auth/popup-closed-by-user') {
          // User cancelled - don't show error
          return;
        }
        
        // Show error toast
        toast({
          variant: 'destructive',
          title: errorTitle,
          description: errorMessage,
        });
      }
    };

    handleRedirectResult();
  }, [mounted, auth, toast]);

  // When user auth state changes, handle redirects. This is the single source of truth for redirection.
  useEffect(() => {
    // Only handle redirects after component is mounted on client
    if (!mounted) return;
    
    if (isUserLoading) return; // Wait until auth state is confirmed

    // If user is NOT logged in and is NOT on the login page, redirect to login.
    if (!user && pathname !== '/login') {
      router.replace('/login');
    }
    
    // If user IS logged in and IS on the login page, redirect to home.
    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isUserLoading, pathname, router, mounted]);

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Serviço de autenticação não disponível. Tente novamente.');
    }
    
    const provider = new GoogleAuthProvider();
    // Request access to the user's calendar
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    
    try {
      // Try popup first (better UX)
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
      
      // User blocked popup - fallback to redirect
      if (authError.code === 'auth/popup-blocked') {
        try {
          // Use redirect as fallback when popup is blocked
          await signInWithRedirect(auth, provider);
          // User will be redirected to Google, then back to our app
          // getRedirectResult will handle the result in useEffect
          return;
        } catch (redirectError) {
          const redirectAuthError = redirectError as AuthError;
          console.error("Redirect sign-in failed:", redirectAuthError);
          throw new Error('Não foi possível fazer login. Por favor, permita popups ou tente novamente.');
        }
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
