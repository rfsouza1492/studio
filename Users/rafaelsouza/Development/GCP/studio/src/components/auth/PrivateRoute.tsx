
"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Target } from 'lucide-react';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Target className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If the user is loaded and exists, render the children.
  if (user) {
    return <>{children}</>;
  }
  
  // If not loading and no user, AuthContext's useEffect will handle redirection.
  // Render a loading state while the redirect is in progress to prevent content flashing.
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
