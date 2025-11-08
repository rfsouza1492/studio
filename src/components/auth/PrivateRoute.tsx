"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { usePathname } from 'next/navigation';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  if (loading) {
     return null; // O layout principal já exibe um loader global
  }

  if (!user && pathname !== '/login') {
    return null; // O AuthProvider fará o redirecionamento
  }

  if (user && pathname === '/login') {
    return null; // O AuthProvider fará o redirecionamento para a home
  }

  return <>{children}</>;
};

export default PrivateRoute;
