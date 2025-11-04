'use client';
import React, { useEffect, useState } from 'react';
import { useGoogleApi, type CalendarEvent } from '@/context/GoogleApiContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, LogIn } from 'lucide-react';
import { CalendarEventList } from '@/components/calendar/CalendarEventList';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
    const { isSignedIn, signIn, listTodayEvents } = useGoogleApi();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isSignedIn) {
            setLoading(true);
            listTodayEvents()
                .then(setEvents)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isSignedIn, listTodayEvents]);

    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
            <Header />
            <main className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <CalendarDays className='h-6 w-6 text-primary' />
                            <span>Eventos da Agenda de Hoje</span>
                        </CardTitle>
                        <CardDescription>
                            Visualize os eventos de hoje do seu Google Calendar e crie tarefas a partir deles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSignedIn ? (
                            <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-card p-12 text-center shadow-sm">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <CalendarDays className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-semibold text-card-foreground">
                                    Conecte seu Google Calendar
                                </h2>
                                <p className="mt-2 max-w-sm text-center text-muted-foreground">
                                    Para ver seus eventos, você precisa conectar sua conta do Google.
                                </p>
                                <Button className="mt-6" onClick={signIn}>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Conectar com o Google
                                </Button>
                            </div>
                        ) : loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : (
                            <CalendarEventList events={events} />
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
