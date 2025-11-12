"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Target, LogIn, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Clear URL parameters to prevent redirect loops
      window.history.replaceState({}, '', '/');
      router.replace('/');
      // Fallback redirect if router doesn't work immediately
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      }, 100);
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    
    try {
      await signInWithGoogle();
      // If using redirect, the page will navigate away
      // If using popup, the useEffect above will handle redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
      setIsSigningIn(false);
    }
  };
  
  if (loading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Target className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-card-foreground">Bem-vindo ao GoalFlow</h1>
        <p className="mb-6 mt-2 text-muted-foreground">Faça login para começar a gerenciar suas metas.</p>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleSignIn} 
          className='w-full' 
          size='lg' 
          disabled={loading || isSigningIn}
        >
          {loading || isSigningIn ? (
            'Carregando...'
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Entrar com Google
            </>
          )}
        </Button>
        
        {isSigningIn && (
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecionando para Google...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
