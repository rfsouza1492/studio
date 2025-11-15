"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Target, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEBOUNCE_DELAY = 2000; // 2 seconds between login attempts

const LoginPage: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const lastAttemptRef = useRef<number>(0);

  // Redirect is handled by AuthContext - no need for local redirect logic
  // AuthContext will redirect authenticated users away from /login automatically

  const handleSignIn = async () => {
    // Rate limiting: prevent rapid clicks
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;
    
    if (timeSinceLastAttempt < DEBOUNCE_DELAY) {
      const remainingTime = Math.ceil((DEBOUNCE_DELAY - timeSinceLastAttempt) / 1000);
      setError(`Por favor, aguarde ${remainingTime} segundo(s) antes de tentar novamente.`);
      return;
    }

    // Reset error and update last attempt time
    setError(null);
    lastAttemptRef.current = now;
    setIsSigningIn(true);
    
    try {
      await signInWithGoogle();
      // If using redirect, the page will navigate away
      // If using popup, AuthContext will handle redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
      setIsSigningIn(false);
      // Reset last attempt on error so user can retry immediately
      lastAttemptRef.current = 0;
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
