"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Target } from "lucide-react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Only redirect after loading is complete
    if (loading) return;
    
    // Redirect to login if not authenticated (except if already on login page)
    if (!user && pathname !== '/login') {
      router.replace('/login');
      return;
    }
    
    // Redirect to home if authenticated and on login page
    // This is handled by AuthProvider, but we keep it as fallback
    if (user && pathname === '/login') {
      router.replace('/');
      return;
    }
  }, [user, loading, pathname, router]);
  
  // Show loading screen during initial auth check
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

  // Don't render children if redirecting
  if (!user && pathname !== '/login') {
    return null;
  }

  // Don't render login page if user is authenticated (redirecting)
  if (user && pathname === '/login') {
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;
