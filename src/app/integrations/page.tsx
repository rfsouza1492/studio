'use client';
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plug } from 'lucide-react';

export default function IntegrationsPage() {
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
            <Header />
            <main className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Plug className='h-6 w-6 text-primary' />
                            <span>Integrações</span>
                        </CardTitle>
                        <CardDescription>
                            Conecte o GoalFlow a outras ferramentas para automatizar seu fluxo de trabalho.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-card p-12 text-center shadow-sm">
                            <h2 className="text-xl font-semibold text-card-foreground">
                                Em breve
                            </h2>
                            <p className="mt-2 max-w-sm text-center text-muted-foreground">
                                Esta área permitirá que você gerencie suas conexões com o Google Calendar, Alexa e outras ferramentas.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
