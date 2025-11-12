"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Target } from "lucide-react";
import { useGoals } from "@/context/GoalContext";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: goalsLoading } = useGoals();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = authLoading || goalsLoading;

  useEffect(() => {
    // If auth state is not determined yet, do nothing.
    if (authLoading) {
      return;
    }

    // If there is no user and the current page is not the login page,
    // redirect to the login page.
    if (!user && pathname !== '/login') {
        router.replace('/login');
    }

    // If there is a user and the current page is the login page,
    // redirect to the home page.
    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, authLoading, pathname, router]);

  // While loading auth or goals, show a global loading screen.
  if (isLoading && pathname !== '/login') {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        </div>
    );
  }
  
  // If a user exists and we are not on the login page, show the children.
  // Or if no user exists and we are on the login page, show the login page.
  if ((user && pathname !== '/login') || (!user && pathname === '/login')) {
    return <>{children}</>;
  }

  // In other cases (like being unauthenticated on a protected route),
  // return a loading state while the redirection is in progress.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Target className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Redirecionando...</p>
        </div>
    </div>
  );
};

export default PrivateRoute;
