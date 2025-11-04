"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Target, Home } from 'lucide-react';
import { AddOrEditGoalDialog } from '@/components/dialogs/AddOrEditGoalDialog';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/today', label: "Today's Tasks", icon: ListTodo },
  ];

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">GoalFlow</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <Link href={link.href} passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === link.href ? 'bg-accent' : ''
                      )}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

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
