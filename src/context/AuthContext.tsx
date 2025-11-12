
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, AuthError, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
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
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only render loading state on client-side to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle redirect result after Google login (fallback for old redirects)
  // Note: We now use signInWithPopup as primary method, but keep this for compatibility
  // Optimized: Use requestIdleCallback to avoid blocking main thread
  useEffect(() => {
    if (!auth || hasCheckedRedirect) return;
    
    // Check if we're coming from a Firebase auth redirect by checking URL params
    // Do this synchronously but quickly
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isAuthRedirect = urlParams?.has('apiKey') || 
                           (typeof window !== 'undefined' && (
                             window.location.href.includes('__/auth/handler') ||
                             window.location.href.includes('authType=signInViaRedirect')
                           ));
    
    // Only process redirect if we detect we came from one
    if (!isAuthRedirect) {
      setHasCheckedRedirect(true);
      return;
    }
    
    // Use requestIdleCallback to defer non-critical work
    const scheduleWork = (callback: () => void) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(callback, 0);
      }
    };
    
    scheduleWork(() => {
      const handleRedirectResult = async () => {
        try {
          // Call getRedirectResult for legacy redirect flows with shorter timeout
          const getRedirectResultPromise = getRedirectResult(auth).catch(() => null);
          const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 3000); // Reduced from 5s to 3s
          });

          const result = await Promise.race([
            getRedirectResultPromise,
            timeoutPromise,
          ]);

          if (result && result.user) {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential?.accessToken) {
              setGoogleApiToken(credential.accessToken);
            }
            
            // Immediately redirect to home after successful login
            if (pathname === '/login' || window.location.pathname === '/login') {
              window.history.replaceState({}, '', '/');
              router.replace('/');
            }
          } else if (auth.currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
            window.history.replaceState({}, '', '/');
            router.replace('/');
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error getting redirect result:", error);
          }
          if (auth.currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
            window.history.replaceState({}, '', '/');
            router.replace('/');
          }
        } finally {
          setHasCheckedRedirect(true);
        }
      };
      
      handleRedirectResult().catch(() => {
        setHasCheckedRedirect(true);
      });
    });
  }, [auth, hasCheckedRedirect, pathname, router]);

  // Redirect to home after successful login (fallback check)
  // Optimized: Use requestIdleCallback to avoid blocking
  useEffect(() => {
    if (isUserLoading) return;
    
    const currentUser = user || (auth?.currentUser);
    
    if (currentUser && (pathname === '/login' || (typeof window !== 'undefined' && window.location.pathname === '/login'))) {
      // Use requestIdleCallback to defer redirect work
      const scheduleRedirect = () => {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          requestIdleCallback(() => {
            window.history.replaceState({}, '', '/');
            router.replace('/');
          }, { timeout: 500 });
        } else {
          setTimeout(() => {
            window.history.replaceState({}, '', '/');
            router.replace('/');
          }, 0);
        }
      };
      
      scheduleRedirect();
    }
  }, [user, isUserLoading, pathname, router, auth]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Use signInWithPopup instead of signInWithRedirect to avoid Chrome's
      // "intermediate website" warning. Popup is opened directly from user interaction
      // and doesn't trigger Chrome's tracking detection.
      const result = await signInWithPopup(auth, provider);
      
      // Extract access token from credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleApiToken(credential.accessToken);
      }
      
      // Redirect to home after successful login
      // The user state will update via onAuthStateChanged, but we can redirect immediately
      if (pathname === '/login' || window.location.pathname === '/login') {
        window.history.replaceState({}, '', '/');
        router.replace('/');
        // Fallback redirect if router doesn't work immediately
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/';
          }
        }, 100);
      }
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
    try {
      await auth.signOut();
      setGoogleApiToken(null);
      router.push('/login');
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing out:", error);
      }
      // Re-throw to allow error boundary to handle it
      throw error;
    }
  };

  const value = { user, loading: isUserLoading, signInWithGoogle, signOut, googleApiToken };

  // Show loading only during initial auth check
  // Add timeout to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    if (isUserLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
      }, 6000); // 6 seconds total (5s Firebase + 1s buffer)
      
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [isUserLoading]);

  // Don't show loading if timeout occurred or not mounted yet (prevent hydration errors)
  if (isMounted && isUserLoading && !loadingTimeout) {
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
