
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Target, Home, LogIn, LayoutDashboard, Menu, LogOut, Calendar, Download } from 'lucide-react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';
import { ImportHubSpotTasksDialog } from '@/components/dialogs/ImportHubSpotTasksDialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';


export function Header() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, signOut, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const navLinks = [
    { href: '/', label: 'Metas', icon: Home },
    { href: '/today', label: "Checklist de Hoje", icon: ListTodo },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Google Calendar', icon: Calendar },
  ];

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Show user-friendly error message
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    }
  };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-3">
        <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">GoalFlow</h1>
    </Link>
  );

  return (
    <>
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 sm:gap-4">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
                <SheetHeader className='p-6'>
                  <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                  <Logo />
                </SheetHeader>
              <Separator />
              <div className="flex flex-col gap-4 p-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                        pathname === link.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
                
                {user && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => setImportDialogOpen(true)} 
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <Download className="h-5 w-5" />
                        Importar HubSpot
                        <Badge variant="secondary" className="ml-auto">52</Badge>
                      </Button>
                      <Button 
                        onClick={() => setDialogOpen(true)} 
                        className="w-full justify-start gap-2"
                      >
                        <Plus className="h-5 w-5" />
                        Nova Meta
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <div className="hidden sm:flex">
            <Logo />
          </div>
        </div>

         <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
                 <Button key={link.href} variant={pathname === link.href ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href={link.href} className="gap-2">
                        <link.icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                </Button>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={() => setImportDialogOpen(true)} 
                  size="sm" 
                  variant="outline"
                  disabled={!user}
                  className="hidden sm:flex gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden md:inline">Importar HubSpot</span>
                  <Badge variant="secondary" className="hidden md:flex h-5 px-1.5 text-xs">
                    52
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Importar 52 tarefas do HubSpot em 6 projetos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={() => setDialogOpen(true)} size="sm" disabled={!user}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova Meta</span>
          </Button>
           {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Usuário'} />
                            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button variant="outline" size="sm" onClick={handleSignIn}>
               <LogIn className="h-4 w-4 sm:mr-2" />
               <span className='hidden sm:inline'>Entrar</span>
             </Button>
          )}

        </div>
      </header>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <ImportHubSpotTasksDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </>
  );
}
