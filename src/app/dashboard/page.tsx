
'use client';

import React from 'react';
import { useGoals } from '@/context/GoalContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { priorities } from '@/app/types';
import { LayoutDashboard } from 'lucide-react';
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const chartConfig = {
    completed: {
        label: "Concluídas",
        color: "hsl(var(--chart-2))",
    },
    pending: {
        label: "Pendentes",
        color: "hsl(var(--muted))",
    },
    High: {
        label: "Alta",
        color: "hsl(var(--chart-1))",
    },
    Medium: {
        label: "Média",
        color: "hsl(var(--chart-3))",
    },
    Low: {
        label: "Baixa",
        color: "hsl(var(--chart-5))",
    },
}

export default function DashboardPage() {
    const { goals, tasks } = useGoals();

    const overallProgress = React.useMemo(() => {
        if (tasks.length === 0) return null;

        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = tasks.length - completedTasks;
        const totalTasks = tasks.length;
        const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
            completed: completedTasks,
            pending: pendingTasks,
            total: totalTasks,
            percentage,
            chartData: [
                { name: 'completed', value: completedTasks, fill: "var(--color-completed)" },
                { name: 'pending', value: pendingTasks, fill: "var(--color-pending)" },
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
            fill: `var(--color-${p})`,
        }));

    }, [tasks]);

    const goalsProgress = React.useMemo(() => {
        return goals.map(goal => {
            let progress = 0;
            let progressText = 'Sem tarefas';

            if (goal.kpiTarget && goal.kpiTarget > 0) {
                const current = goal.kpiCurrent || 0;
                progress = (current / goal.kpiTarget) * 100;
                progressText = `${current} de ${goal.kpiTarget} ${goal.kpiName || ''}`;
            } else {
                const goalTasks = tasks.filter(t => t.goalId === goal.id);
                if (goalTasks.length > 0) {
                    const completedTasks = goalTasks.filter(t => t.completed).length;
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
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
            <Header />
            <main className="mt-8">
                <div className='mb-8 flex items-center gap-2'>
                    <LayoutDashboard className='h-8 w-8 text-primary' />
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard de Produtividade</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                    
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Progresso das Metas</CardTitle>
                            <CardDescription>Acompanhe o avanço de cada uma das suas metas.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                             {goalsProgress.length > 0 ? goalsProgress.map(goal => (
                                <div key={goal.id} className="grid gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-card-foreground">{goal.name}</span>
                                        <span className="text-muted-foreground">{goal.progressText}</span>
                                    </div>
                                    <Progress value={goal.progress} indicatorClassName={goal.progress === 100 ? 'bg-green-500' : ''} />
                                </div>
                            )) : (
                                <p className="py-8 text-center text-muted-foreground">Nenhuma meta criada ainda.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Progresso Geral</CardTitle>
                             {overallProgress && <CardDescription>
                                {overallProgress.completed} de {overallProgress.total} tarefas concluídas.
                            </CardDescription>}
                        </CardHeader>
                        <CardContent>
                            {overallProgress ? (
                                <ChartContainer config={chartConfig} className="h-48 w-full">
                                    <PieChart accessibilityLayer>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                        <Pie data={overallProgress.chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                            <Cell key="completed" fill="var(--color-completed)" />
                                            <Cell key="pending" fill="var(--color-pending)" />
                                        </Pie>
                                         <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex h-48 w-full items-center justify-center text-center">
                                    <p className="text-muted-foreground">Nenhuma tarefa para exibir.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-full lg:col-span-5">
                        <CardHeader>
                            <CardTitle>Tarefas Pendentes por Prioridade</CardTitle>
                            <CardDescription>Distribuição das tarefas que ainda não foram concluídas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-60 w-full">
                                <BarChart accessibilityLayer data={tasksByPriority} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="count" radius={8} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
