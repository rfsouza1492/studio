"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Target, LogIn } from 'lucide-react';
import { useEffect } from 'react';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);
  
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
        <Button onClick={signInWithGoogle} className='w-full' size='lg' disabled={loading}>
          {loading ? 'Carregando...' : <><LogIn className="mr-2 h-4 w-4" /> Entrar com Google</>}
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
