
"use client";

import React from 'react';
import { Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is now a transitional loading screen.
// PrivateRoute and AuthContext handle all the logic.
const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // If a user session exists, redirect to home.
  // This is a fallback, as PrivateRoute should handle this.
  useEffect(() => {
      if(user && !loading) {
          router.replace('/');
      }
  }, [user, loading, router]);
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Target className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Iniciando sessão segura...</p>
        </div>
    </div>
  );
};

export default LoginPage;
