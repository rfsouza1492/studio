"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Target } from "lucide-react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // This component's main responsibility is now just to show a loading screen
  // or render children, not to handle redirection logic.
  // Redirection is now centralized in AuthContext.
  
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

  // If loading is finished, and we're on the correct page (AuthContext handled redirect), render children.
  // This prevents rendering children on a protected route while unauthenticated, as AuthContext would have already redirected.
  if ((user && pathname !== '/login') || (!user && pathname === '/login')) {
      return <>{children}</>;
  }

  // If logic above doesn't pass, it means a redirect is likely in flight from AuthContext.
  // Render a loading state to prevent flash of incorrect content.
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
