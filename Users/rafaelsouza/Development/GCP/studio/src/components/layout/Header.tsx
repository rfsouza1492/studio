
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Target, Home, LayoutDashboard, Menu, LogOut } from 'lucide-react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';


export function Header() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { href: '/', label: 'Metas', icon: Home },
    { href: '/today', label: "Checklist de Hoje", icon: ListTodo },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

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
          <Button onClick={() => setDialogOpen(true)} size="sm" disabled={!user}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova Meta</span>
          </Button>
           {user && (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={''} alt={'Usuário Anônimo'} />
                            <AvatarFallback>{"G"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Convidado</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          Sessão anônima
                        </p>
                    </div>
                    </DropdownMenuLabel>
                </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </header>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
