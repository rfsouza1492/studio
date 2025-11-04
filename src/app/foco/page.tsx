'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGoals } from '@/context/GoalContext';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RefreshCw, Coffee, BrainCircuit, CheckCircle2 } from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak';

const POMODORO_DURATION = 25 * 60;
const SHORT_BREAK_DURATION = 5 * 60;


export default function FocoPage() {
    const { tasks, toggleTask } = useGoals();
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [time, setTime] = useState(POMODORO_DURATION);
    const [isActive, setIsActive] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);

    const incompleteTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);
    const selectedTask = useMemo(() => tasks.find(task => task.id === selectedTaskId), [tasks, selectedTaskId]);

     const handleTimerToggle = useCallback(() => {
        setIsActive(prev => !prev);
    }, []);


    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(t => t - 1);
            }, 1000);
        } else if (isActive && time === 0) {
             const audio = new Audio('/alarm.mp3');
             audio.play().catch(e => console.log("Failed to play audio:", e));
            
            if (mode === 'pomodoro') {
                if(selectedTaskId) {
                    toggleTask(selectedTaskId);
                }
                setPomodoroCount(prev => prev + 1);
                // Switch to a break after a pomodoro
                switchMode('shortBreak');
            } else {
                 // Switch back to pomodoro after a break
                switchMode('pomodoro');
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, time, mode, selectedTaskId, toggleTask]);
    
    useEffect(() => {
        document.title = `${formatTime(time)} - ${mode === 'pomodoro' ? 'Foco' : 'Pausa'}`;
    }, [time, mode]);

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        setTime(newMode === 'pomodoro' ? POMODORO_DURATION : SHORT_BREAK_DURATION);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleReset = () => {
        setIsActive(false);
        setTime(mode === 'pomodoro' ? POMODORO_DURATION : SHORT_BREAK_DURATION);
    };

    const progressPercentage = ((mode === 'pomodoro' ? POMODORO_DURATION : SHORT_BREAK_DURATION) - time) / (mode === 'pomodoro' ? POMODORO_DURATION : SHORT_BREAK_DURATION) * 100;

    return (
        <div className="container mx-auto max-w-2xl p-4 sm:p-6 md:p-8">
            <Header />
            <main className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <BrainCircuit className="h-6 w-6 text-primary" />
                             Sessão de Foco
                           </div>
                           <div className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>Ciclos: {pomodoroCount}</span>
                           </div>
                        </CardTitle>
                        <CardDescription>
                            Escolha uma tarefa, inicie o timer e concentre-se.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-8">
                        {/* Task Selector */}
                        <div className="w-full max-w-sm">
                             <Select onValueChange={setSelectedTaskId} value={selectedTaskId || ""}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma tarefa para focar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {incompleteTasks.length > 0 ? incompleteTasks.map(task => (
                                        <SelectItem key={task.id} value={task.id}>
                                            {task.title}
                                        </SelectItem>
                                    )) : <div className="p-4 text-sm text-muted-foreground">Nenhuma tarefa incompleta.</div>}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Timer Display */}
                        <div className="relative flex h-64 w-64 items-center justify-center rounded-full">
                            <svg className="absolute h-full w-full" viewBox="0 0 100 100">
                               <circle className="stroke-current text-border" strokeWidth="4" cx="50" cy="50" r="45" fill="transparent"></circle>
                               <circle 
                                 className="stroke-current text-primary transition-all duration-300"
                                 strokeWidth="4"
                                 strokeLinecap="round"
                                 cx="50"
                                 cy="50"
                                 r="45"
                                 fill="transparent"
                                 strokeDasharray={2 * Math.PI * 45}
                                 strokeDashoffset={2 * Math.PI * 45 * (1 - progressPercentage / 100)}
                                 transform="rotate(-90 50 50)"
                                ></circle>
                            </svg>
                             <div className="text-center">
                                <p className="text-6xl font-bold tabular-nums text-foreground">{formatTime(time)}</p>
                                <p className="text-sm uppercase tracking-widest text-muted-foreground">
                                    {selectedTask ? selectedTask.title : 'Foco'}
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <Button variant={mode === 'pomodoro' ? 'default' : 'outline'} onClick={() => switchMode('pomodoro')}>
                                <BrainCircuit className="mr-2 h-4 w-4" /> Foco
                            </Button>
                            <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={() => switchMode('shortBreak')}>
                               <Coffee className="mr-2 h-4 w-4" /> Pausa
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                             <Button size="lg" onClick={handleTimerToggle} disabled={!selectedTaskId}>
                                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                <span className="ml-2">{isActive ? 'Pausar' : 'Iniciar'}</span>
                            </Button>
                            <Button size="lg" variant="ghost" onClick={handleReset}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
