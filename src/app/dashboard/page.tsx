'use client';

import React from 'react';
import { useGoals } from '@/context/GoalContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { priorities } from '@/app/types';
import { LayoutDashboard } from 'lucide-react';

const COLORS = {
    High: 'hsl(var(--destructive))',
    Medium: 'hsl(var(--accent))',
    Low: 'hsl(var(--sucesso))',
    completed: 'hsl(var(--primary))',
    pending: 'hsl(var(--muted))',
};

const priorityColors = {
    High: 'hsl(var(--chart-1))',
    Medium: 'hsl(var(--chart-2))',
    Low: 'hsl(var(--chart-3))',
}

export default function DashboardPage() {
    const { goals, tasks } = useGoals();

    const overallProgress = React.useMemo(() => {
        if (tasks.length === 0) {
            return {
                completed: 0,
                pending: 0,
                total: 0,
                percentage: 0,
                data: []
            };
        }
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        return {
            completed: completedTasks,
            pending: totalTasks - completedTasks,
            total: totalTasks,
            percentage,
            data: [
                { name: 'Concluídas', value: completedTasks, color: COLORS.completed },
                { name: 'Pendentes', value: totalTasks - completedTasks, color: COLORS.pending },
            ]
        };
    }, [tasks]);

    const tasksByPriority = React.useMemo(() => {
        const counts = { Low: 0, Medium: 0, High: 0 };
        tasks.filter(t => !t.completed).forEach(task => {
            counts[task.priority] = (counts[task.priority] || 0) + 1;
        });

        return priorities.map(p => ({
            name: p,
            count: counts[p],
            fill: priorityColors[p],
        }));

    }, [tasks]);

    const goalsProgress = React.useMemo(() => {
        return goals.map(goal => {
            let progress = 0;
            let progressText = 'Sem tarefas';

            // KPI-based progress
            if (goal.kpiTarget && goal.kpiTarget > 0) {
                const current = goal.kpiCurrent || 0;
                progress = (current / goal.kpiTarget) * 100;
                progressText = `${current}/${goal.kpiTarget} ${goal.kpiName || ''}`;
            } else { // Task-based progress
                const goalTasks = tasks.filter(t => t.goalId === goal.id);
                const completedTasks = goalTasks.filter(t => t.completed).length;
                if (goalTasks.length > 0) {
                    progress = (completedTasks / goalTasks.length) * 100;
                    progressText = `${completedTasks} de ${goalTasks.length} tarefas`;
                }
            }
            return {
                id: goal.id,
                name: goal.name,
                progress,
                progressText,
            };
        });
    }, [goals, tasks]);

    return (
        <div className="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
            <Header />
            <main className="mt-8">
                <div className='flex items-center gap-2 mb-8'>
                    <LayoutDashboard className='h-8 w-8 text-primary' />
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Overall Progress */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Progresso Geral de Tarefas</CardTitle>
                            <CardDescription>
                                {overallProgress.completed} de {overallProgress.total} tarefas concluídas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {overallProgress.total > 0 ? (
                                <div className="h-60 w-full">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={overallProgress.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {overallProgress.data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} tarefas`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-60 w-full items-center justify-center text-center">
                                    <p className="text-muted-foreground">Nenhuma tarefa para exibir.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tasks by Priority */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Tarefas Pendentes por Prioridade</CardTitle>
                            <CardDescription>Distribuição das tarefas que ainda não foram concluídas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-60 w-full">
                                <ResponsiveContainer>
                                    <BarChart data={tasksByPriority} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => [`${value} tarefas`, 'Total']} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Goals Progress */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Progresso das Metas</CardTitle>
                            <CardDescription>Acompanhe o avanço de cada uma das suas metas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {goalsProgress.length > 0 ? goalsProgress.map(goal => (
                                <div key={goal.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-card-foreground">{goal.name}</span>
                                        <span className="text-muted-foreground">{goal.progressText}</span>
                                    </div>
                                    <Progress value={goal.progress} className="h-2" />
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground">Nenhuma meta criada ainda.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
