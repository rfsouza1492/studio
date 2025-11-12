
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

  const isLoading = authLoading || (user && goalsLoading);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user && pathname !== '/login') {
        router.replace('/login');
    }

    if (user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, authLoading, pathname, router]);

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
  
  if ((user && pathname !== '/login') || (!user && pathname === '/login')) {
    return <>{children}</>;
  }

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
