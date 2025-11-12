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

  // If user is not logged in, AuthProvider will redirect to /login
  // So, if we are not loading and user exists, we can render the children.
  if (user) {
    return <>{children}</>;
  }
  
  // Return a loader while the redirect is happening
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
