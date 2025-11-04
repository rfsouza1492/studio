"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Target, Home, User, LogIn, CalendarDays, BrainCircuit, LayoutDashboard, Menu } from 'lucide-react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useGoogleApi } from '@/context/GoogleApiContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export function Header() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const pathname = usePathname();
  const { isSignedIn, signIn, signOut, user, isGapiReady } = useGoogleApi();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/today', label: "Today's Tasks", icon: ListTodo },
    { href: '/calendar', label: 'Agenda', icon: CalendarDays },
    { href: '/foco', label: 'Foco', icon: BrainCircuit },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="text-left">
                  <SheetTitle>Menu Principal</SheetTitle>
                  <SheetDescription asChild>
                    <Link href="/" className="flex items-center gap-3 py-4">
                      <Target className="h-8 w-8 text-primary" />
                      <h1 className="text-2xl font-bold text-foreground">GoalFlow</h1>
                    </Link>
                  </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground",
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
          <Link href="/" className="hidden sm:flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">GoalFlow</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <Button onClick={signOut} variant="outline" disabled={!isGapiReady}>
              <User className="-ml-1 h-5 w-5" />
              <span>{user?.name}</span>
            </Button>
          ) : (
            <Button onClick={signIn} disabled={!isGapiReady}>
              <CalendarDays className="-ml-1 h-5 w-5" />
              <span>Connect</span>
            </Button>
          )}

          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="-ml-1 h-5 w-5" />
            <span>New Goal</span>
          </Button>
        </div>
      </header>
      <AddOrEditGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
