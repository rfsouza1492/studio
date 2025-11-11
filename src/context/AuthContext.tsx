
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

  // Handle redirect result after Google login (fallback for old redirects)
  // Note: We now use signInWithPopup as primary method, but keep this for compatibility
  useEffect(() => {
    const handleRedirectResult = async () => {
      if (!auth || hasCheckedRedirect) return;
      
      // Check if we're coming from a Firebase auth redirect by checking URL params
      const urlParams = new URLSearchParams(window.location.search);
      const isAuthRedirect = urlParams.has('apiKey') || 
                             window.location.href.includes('__/auth/handler') ||
                             window.location.href.includes('authType=signInViaRedirect');
      
      // Only process redirect if we detect we came from one
      if (!isAuthRedirect) {
        setHasCheckedRedirect(true);
        return;
      }
      
      try {
        // Call getRedirectResult for legacy redirect flows
        const getRedirectResultPromise = getRedirectResult(auth).catch(() => null);
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 5000);
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
          // Clear any URL parameters first to prevent redirect loops
          if (pathname === '/login' || window.location.pathname === '/login') {
            window.history.replaceState({}, '', '/');
            router.replace('/');
            setTimeout(() => {
              if (window.location.pathname === '/login') {
                window.location.href = '/';
              }
            }, 100);
          }
        } else {
          // Wait a bit for auth state to update
          setTimeout(() => {
            if (auth.currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
              window.history.replaceState({}, '', '/');
              router.replace('/');
              setTimeout(() => {
                if (window.location.pathname === '/login') {
                  window.location.href = '/';
                }
              }, 100);
            }
          }, 500);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error getting redirect result:", error);
        }
        // Even on error, check if user is authenticated
        if (auth.currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
          window.history.replaceState({}, '', '/');
          router.replace('/');
          setTimeout(() => {
            if (window.location.pathname === '/login') {
              window.location.href = '/';
            }
          }, 100);
        }
      } finally {
        setHasCheckedRedirect(true);
      }
    };
    
    if (auth) {
      handleRedirectResult().catch(() => {
        setHasCheckedRedirect(true);
      });
    }
  }, [auth, hasCheckedRedirect, pathname, router]);

  // Redirect to home after successful login (fallback check)
  useEffect(() => {
    // Check both user from hook and auth.currentUser (more reliable after redirect)
    const currentUser = user || (auth?.currentUser);
    
    if (!isUserLoading && currentUser && (pathname === '/login' || window.location.pathname === '/login')) {
      // Clear URL parameters to prevent redirect loops
      window.history.replaceState({}, '', '/');
      router.replace('/');
      // Use window.location as backup to ensure redirect happens
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      }, 100);
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
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error signing in with Google:", error);
      }
      // Re-throw to allow error boundary to handle it
      throw error;
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

  // Don't show loading if timeout occurred - let the page render
  if (isUserLoading && !loadingTimeout) {
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
