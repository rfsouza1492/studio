"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Home, RefreshCw, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const errorMessages: Record<string, { title: string; description: string }> = {
  access_denied: {
    title: 'Acesso Negado',
    description: 'Você negou o acesso à aplicação. Para usar o GoalFlow, precisamos de permissão para acessar seu calendário do Google.',
  },
  authentication_failed: {
    title: 'Falha na Autenticação',
    description: 'Não foi possível completar a autenticação. Por favor, tente novamente.',
  },
  invalid_state: {
    title: 'Erro de Segurança',
    description: 'A requisição de autenticação expirou ou é inválida. Por favor, tente fazer login novamente.',
  },
  unknown_error: {
    title: 'Erro Desconhecido',
    description: 'Ocorreu um erro inesperado durante a autenticação. Por favor, tente novamente.',
  },
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorCode, setErrorCode] = useState<string>('unknown_error');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const message = searchParams.get('message') || 'unknown_error';
    
    // Validate error code against whitelist to prevent injection
    const validErrorCodes = Object.keys(errorMessages);
    const safeErrorCode = validErrorCodes.includes(message) ? message : 'unknown_error';
    
    setErrorCode(safeErrorCode);
  }, [searchParams]);

  const errorInfo = errorMessages[errorCode] || errorMessages.unknown_error;

  const handleRetry = () => {
    // Redirect to calendar page which will trigger OAuth flow again
    router.push('/calendar');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          <CardDescription className="mt-2">{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de Autenticação</AlertTitle>
            <AlertDescription>
              Código do erro: <code className="text-xs bg-muted px-1 py-0.5 rounded">{errorCode}</code>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Voltar para Início
            </Button>
          </div>

          {errorCode === 'access_denied' && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Dica:</strong> Quando você clicar em "Tentar Novamente", certifique-se de clicar em "Permitir" 
                na tela de permissões do Google para que o GoalFlow possa acessar seu calendário.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

