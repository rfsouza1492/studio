
"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, Download, FileJson, Loader2 } from 'lucide-react';
import { useGoals } from '@/context/GoalContext';
import { useToast } from '@/hooks/use-toast';
import hubspotData from '../../../hubspot-tasks-import.json';

interface ImportHubSpotTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProjectSelection {
  [key: string]: boolean;
}

export function ImportHubSpotTasksDialog({ open, onOpenChange }: ImportHubSpotTasksDialogProps) {
  const { addGoal, addTask } = useGoals();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<ProjectSelection>({});
  const [importComplete, setImportComplete] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const projects = hubspotData.projects;

  React.useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setImportComplete(false);
      setImportedCount(0);
      setSelectedProjects({});
    }
  }, [open]);

  const toggleProject = (index: number) => {
    setSelectedProjects(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAll = () => {
    const allSelected = Object.keys(selectedProjects).length === projects.length &&
      Object.values(selectedProjects).every(v => v);
    
    if (allSelected) {
      setSelectedProjects({});
    } else {
      const newSelection: ProjectSelection = {};
      projects.forEach((_, index) => {
        newSelection[index] = true;
      });
      setSelectedProjects(newSelection);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    let totalImported = 0;

    try {
      for (const [indexStr, isSelected] of Object.entries(selectedProjects)) {
        if (!isSelected) continue;

        const index = parseInt(indexStr);
        const project = projects[index];

        // Criar a meta
        const goalData = {
          name: project.goal.name,
          kpiName: project.goal.kpiName,
          kpiTarget: project.goal.kpiTarget,
          kpiCurrent: project.goal.kpiCurrent,
        };

        const newGoalId = await addGoal(goalData);

        // Adicionar tarefas à meta
        for (const task of project.tasks) {
          const deadline = task.deadline ? new Date(task.deadline) : undefined;
          await addTask(
            newGoalId,
            task.title,
            task.priority,
            task.recurrence,
            deadline,
            task.duration
          );
          totalImported++;
        }

        // Pequeno delay para não sobrecarregar o Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImportedCount(totalImported);
      setImportComplete(true);

      toast({
        title: "Importação Concluída!",
        description: `${totalImported} tarefas importadas com sucesso em ${Object.values(selectedProjects).filter(Boolean).length} projetos.`,
      });

    } catch (error) {
      console.error('Erro ao importar tarefas:', error);
      toast({
        variant: "destructive",
        title: "Erro na Importação",
        description: error instanceof Error ? error.message : "Não foi possível importar as tarefas.",
      });
    } finally {
      setImporting(false);
    }
  };

  const getProjectStats = (project: typeof projects[0]) => {
    const now = new Date();
    const urgent = project.tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }).length;
    
    const overdue = project.tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline < now;
    }).length;

    const highPriority = project.tasks.filter(t => t.priority === 'High').length;
    const totalTime = project.tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / 60;

    return { urgent, overdue, highPriority, totalTime };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  if (importComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Importação Concluída!
            </DialogTitle>
            <DialogDescription>
              Todas as tarefas foram importadas com sucesso para o GoalFlow.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="text-6xl font-bold text-primary mb-2">{importedCount}</div>
            <p className="text-muted-foreground">tarefas importadas</p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Importar Tarefas do HubSpot
          </DialogTitle>
          <DialogDescription>
            Selecione os projetos que deseja importar. Total: {hubspotData.summary.totalTasks} tarefas em {hubspotData.summary.totalProjects} projetos.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
              >
                {Object.values(selectedProjects).filter(Boolean).length === projects.length 
                  ? 'Desmarcar Todos' 
                  : 'Selecionar Todos'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {Object.values(selectedProjects).filter(Boolean).length} de {projects.length} selecionados
              </span>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {projects.map((project, index) => {
                  const stats = getProjectStats(project);
                  const isSelected = selectedProjects[index] || false;

                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                      }`}
                      onClick={() => toggleProject(index)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProject(index)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">{project.goal.name}</h3>
                            {stats.overdue > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {stats.overdue} atrasadas
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileJson className="h-3 w-3" />
                              {project.tasks.length} tarefas
                            </span>
                            {stats.urgent > 0 && (
                              <span className="flex items-center gap-1 text-orange-600">
                                <AlertCircle className="h-3 w-3" />
                                {stats.urgent} urgentes
                              </span>
                            )}
                            {stats.highPriority > 0 && (
                              <span className="flex items-center gap-1">
                                🔴 {stats.highPriority} alta prioridade
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {stats.totalTime.toFixed(1)}h
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {project.goal.kpiName}: {project.goal.kpiCurrent}/{project.goal.kpiTarget}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">{hubspotData.summary.totalTasks}</div>
                    <div className="text-sm text-muted-foreground">Total de Tarefas</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{hubspotData.summary.urgentTasks}</div>
                    <div className="text-sm text-muted-foreground">Tarefas Urgentes</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{hubspotData.summary.highPriorityTasks}</div>
                    <div className="text-sm text-muted-foreground">Alta Prioridade</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-2xl font-bold">{hubspotData.summary.totalEstimatedHours}h</div>
                    <div className="text-sm text-muted-foreground">Tempo Total</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Tarefas por Projeto</h4>
                  {projects.map((project, index) => {
                    const stats = getProjectStats(project);
                    return (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{project.goal.name}</span>
                          <Badge variant="outline">{project.tasks.length} tarefas</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Urgentes:</span> {stats.urgent}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Alta Prior.:</span> {stats.highPriority}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tempo:</span> {stats.totalTime.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={importing || Object.values(selectedProjects).filter(Boolean).length === 0}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Importar {Object.values(selectedProjects).filter(Boolean).length > 0 
                  ? `(${Object.values(selectedProjects).filter(Boolean).length})` 
                  : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

