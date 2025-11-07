"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Target } from "lucide-react";

const publicRoutes = ["/login"];

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

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

  if (!user && !publicRoutes.includes(pathname)) {
    return null; // ou um spinner, enquanto redireciona
  }

  return <>{children}</>;
};

export default PrivateRoute;
