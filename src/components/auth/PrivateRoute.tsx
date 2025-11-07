
"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";
import { Target } from "lucide-react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { loading } = useAuth();
  
  if (loading) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 animate-pulse text-primary" />
                <p className="text-muted-foreground">Verificando autenticação...</p>
            </div>
        </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
