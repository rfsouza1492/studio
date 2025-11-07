
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Simulação de um objeto de usuário
interface SimulatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: SimulatedUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria um usuário simulado com um UID estático
const mockUser: SimulatedUser = {
    uid: 'mock-user-123',
    email: 'user@example.com',
    displayName: 'Usuário de Teste',
    photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SimulatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula o carregamento e, em seguida, define o usuário como logado.
    const timer = setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signInWithGoogle = () => {
    setLoading(true);
    setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
    }, 500)
  };

  const signOut = () => {
    setLoading(true);
    setTimeout(() => {
        setUser(null);
        setLoading(false);
    }, 500)
  };

  const value = { user, loading, signInWithGoogle, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
