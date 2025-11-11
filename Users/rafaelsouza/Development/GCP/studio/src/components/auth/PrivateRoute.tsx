"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Target } from "lucide-react";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redirecione para o login.
    // Evita redirecionar se já estivermos na página de login.
    if (!loading && !user && pathname !== '/login') {
        router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  // Exibe o carregamento enquanto a autenticação está sendo verificada.
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
  
  // Se o usuário não existir e o caminho não for o login, não renderize nada
  // pois o redirecionamento está em andamento.
  if (!user && pathname !== '/login') {
    return null;
  }
  
  // Se houver um usuário e estivermos na página de login, o AuthProvider/página de login
  // cuidará do redirecionamento. Renderizar null evita um flash de conteúdo.
  if (user && pathname === '/login') {
      return null;
  }

  // Se as condições acima não forem atendidas, renderize o conteúdo da rota.
  return <>{children}</>;
};

export default PrivateRoute;
