
"use client";

import React from 'react';
import { Target } from 'lucide-react';

// Esta página é agora uma tela de carregamento puramente visual.
// O componente PrivateRoute lida com toda a lógica de redirecionamento.
const LoginPage: React.FC = () => {
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
