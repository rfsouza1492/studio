
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Target, Home, User, LogIn, CalendarDays, BrainCircuit, LayoutDashboard, Menu, Plug, Mic } from 'lucide-react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useGoogleApi } from '@/context/GoogleApiContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';


export function Header() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const pathname = usePathname();
  const { isSignedIn, signIn, signOut, user, isGapiReady } = useGoogleApi();

  const navLinks = [
    { href: '/', label: 'Metas', icon: Home },
    { href: '/today', label: "Checklist de Hoje", icon: ListTodo },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/foco', label: 'Foco', icon: BrainCircuit },
    { href: '/calendar', label: 'Agenda', icon: CalendarDays },
    { href: '/agent', label: 'Agente IA', icon: Mic },
    { href: '/integrations', label: 'Integrações', icon: Plug },
  ];

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
                <div className='p-6'>
                    <Link href="/" className="flex items-center gap-3">
                      <Target className="h-7 w-7 text-primary" />
                      <h1 className="text-2xl font-bold text-foreground">GoalFlow</h1>
                    </Link>
                </div>
              <Separator />
              <div className="flex flex-col gap-4 p-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
                          pathname === link.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-3">
            <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">GoalFlow</h1>
          </Link>
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
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova Meta</span>
          </Button>
           {isSignedIn ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={(user as any)?.picture} alt={user?.name} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={signIn} variant="outline" size="sm" disabled={!isGapiReady}>
              <LogIn className="h-4 w-4 sm:mr-2" />
              <span className='hidden sm:inline'>Conectar</span>
            </Button>
          )}

        </div>
      </header>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
