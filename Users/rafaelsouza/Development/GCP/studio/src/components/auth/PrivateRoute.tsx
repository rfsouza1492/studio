
"use client";

import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalContext";
import { ReactNode, useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Target } from "lucide-react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: goalsLoading } = useGoals();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render a consistent loading state
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Target className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // After mount, handle loading and rendering logic
  if (authLoading || (user && goalsLoading && pathname !== '/login')) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        </div>
    );
  }

  // If loading is finished, and we're on the correct page based on auth state, render children.
  if ((user && pathname !== '/login') || (!user && pathname === '/login')) {
      return <>{children}</>;
  }

  // Fallback for edge cases during redirects, though AuthProvider's useEffect should handle it.
  return null;
};

export default PrivateRoute;
