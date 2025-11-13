#!/usr/bin/env node

/**
 * Script para importar TODAS as tarefas do HubSpot no GoalFlow
 * 
 * Usage:
 *   node scripts/import-patagon-tasks.js [--project=nome]
 * 
 * Este script importa tarefas de múltiplos projetos do HubSpot report.
 * Use --project para filtrar um projeto específico.
 * 
 * Projetos disponíveis:
 *   - formulario
 *   - patagon
 *   - vexpenses
 *   - tracking
 *   - rotunno
 *   - analises
 */

const fs = require('fs');
const path = require('path');

// Carregar dados do JSON
const hubspotData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../hubspot-tasks-import.json'), 'utf8')
);

// Dados legados (mantido para compatibilidade)
const patagonStarData = {
  goal: {
    name: "Meta Patagon Star",
    kpiName: "Tarefas Completadas",
    kpiTarget: 11,
    kpiCurrent: 0
  },
  tasks: [
    {
      title: "VExpenses: Apresentar proposta de critérios para leads premium",
      priority: "High",
      deadline: "2025-11-28T21:00:00",
      duration: 120,
      recurrence: "None",
      category: "Produto/Estratégia"
    },
    {
      title: "VExpenses: Implementar ajustes no prompt baseados no feedback da Alana",
      priority: "High",
      deadline: "2025-11-21T21:00:00",
      duration: 90,
      recurrence: "None",
      category: "IA/Prompt Engineering"
    },
    {
      title: "VExpenses: Desenvolver dashboard com dados cruzados WhatsApp + Pipedrive",
      priority: "High",
      deadline: "2025-11-21T21:00:00",
      duration: 240,
      recurrence: "None",
      category: "Desenvolvimento/Integração"
    },
    {
      title: "Implementar orientação para clientes quando conteúdo for PDF ou imagem",
      priority: "Medium",
      deadline: "2025-11-17T15:28:00",
      duration: 60,
      recurrence: "None",
      category: "UX/Frontend"
    },
    {
      title: "Retornar sobre melhoria na clareza dos detalhes da nova interface de attribution",
      priority: "Medium",
      deadline: "2025-11-17T15:28:00",
      duration: 45,
      recurrence: "None",
      category: "UX/Design"
    },
    {
      title: "Melhorar mensagem de erro da API quando email já existe mas CNPJ não está cadastrado",
      priority: "Medium",
      deadline: "2025-11-17T15:28:00",
      duration: 30,
      recurrence: "None",
      category: "Backend/API"
    },
    {
      title: "Atualizar settings para Salesforce",
      priority: "Medium",
      deadline: "2025-11-17T15:05:00",
      duration: 45,
      recurrence: "None",
      category: "Integração/Config"
    },
    {
      title: "Investigar e corrigir inconsistências nos dados do dashboard da Patagon",
      priority: "High",
      deadline: "2025-11-17T14:43:00",
      duration: 120,
      recurrence: "None",
      category: "Bug/Investigação"
    },
    {
      title: "Corrigir prompt da IA: Regras de qualificação e desqualificação de leads",
      priority: "High",
      deadline: "2025-11-17T14:17:00",
      duration: 90,
      recurrence: "None",
      category: "IA/Prompt Engineering"
    },
    {
      title: "Solicitar correção de cadastro - Endereço incorreto na base do prestador Patagon",
      priority: "Low",
      deadline: "2025-11-17T14:12:00",
      duration: 15,
      recurrence: "None",
      category: "Administrativo/Dados"
    },
    {
      title: "Adicionar informação sobre crediário no follow-up de agendamento",
      priority: "Medium",
      deadline: "2025-11-17T13:54:00",
      duration: 30,
      recurrence: "None",
      category: "Comunicação/Template"
    }
  ]
};

// Análise e estatísticas
function analyzePatagonTasks() {
  const tasks = patagonStarData.tasks;
  
  const urgentTasks = tasks.filter(t => {
    const deadline = new Date(t.deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7;
  });

  const highPriorityTasks = tasks.filter(t => t.priority === "High");
  
  const totalEstimatedTime = tasks.reduce((sum, t) => sum + t.duration, 0);
  
  const byCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  return {
    total: tasks.length,
    urgent: urgentTasks.length,
    highPriority: highPriorityTasks.length,
    totalHours: (totalEstimatedTime / 60).toFixed(1),
    byCategory
  };
}

// Console output formatado
function displaySummary() {
  const stats = analyzePatagonTasks();
  
  console.log('\n🎯 Meta Patagon Star - Resumo de Importação\n');
  console.log('━'.repeat(60));
  console.log(`📋 Total de Tarefas: ${stats.total}`);
  console.log(`⚠️  Tarefas Urgentes (próximos 7 dias): ${stats.urgent}`);
  console.log(`🔴 Tarefas Alta Prioridade: ${stats.highPriority}`);
  console.log(`⏱️  Tempo Total Estimado: ${stats.totalHours} horas`);
  console.log('━'.repeat(60));
  
  console.log('\n📊 Distribuição por Categoria:\n');
  Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`   ${category.padEnd(30)} ${count} tarefa${count > 1 ? 's' : ''}`);
    });
  
  console.log('\n━'.repeat(60));
  console.log('\n📅 Tarefas por Prazo:\n');
  
  const tasksByDate = patagonStarData.tasks
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  
  tasksByDate.forEach(task => {
    const deadline = new Date(task.deadline);
    const dateStr = deadline.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const priorityIcon = {
      'High': '🔴',
      'Medium': '🟡',
      'Low': '🟢'
    }[task.priority];
    
    console.log(`   ${priorityIcon} ${dateStr} - ${task.title.substring(0, 60)}${task.title.length > 60 ? '...' : ''}`);
  });
  
  console.log('\n━'.repeat(60));
}

// Exportar dados para uso em outros scripts
function exportForFirebase() {
  return {
    goal: patagonStarData.goal,
    tasks: patagonStarData.tasks.map(task => ({
      ...task,
      completed: false,
      // Converter deadline para ISO string se necessário
      deadline: task.deadline ? new Date(task.deadline).toISOString() : undefined
    }))
  };
}

// Analisar todos os projetos do HubSpot
function analyzeAllProjects() {
  const projects = hubspotData.projects;
  const summary = hubspotData.summary;
  
  const now = new Date();
  const urgentThreshold = 7 * 24 * 60 * 60 * 1000; // 7 dias
  
  const projectStats = projects.map(project => {
    const tasks = project.tasks;
    const urgent = tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return (deadline - now) <= urgentThreshold && deadline >= now;
    }).length;
    
    const overdue = tasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline < now;
    }).length;
    
    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const totalTime = tasks.reduce((sum, t) => sum + (t.duration || 0), 0) / 60;
    
    return {
      name: project.goal.name,
      total: tasks.length,
      urgent,
      overdue,
      highPriority,
      totalHours: totalTime.toFixed(1)
    };
  });
  
  return { projectStats, summary };
}

// Display completo de todos os projetos
function displayAllProjects() {
  const { projectStats, summary } = analyzeAllProjects();
  
  console.log('\n🎯 HubSpot Tasks - Visão Completa\n');
  console.log('━'.repeat(80));
  console.log(`📊 Total: ${summary.totalTasks} tarefas | ${summary.totalProjects} projetos`);
  console.log(`⚠️  Urgentes: ${summary.urgentTasks} tarefas (próximos 7 dias)`);
  console.log(`🔴 Alta Prioridade: ${summary.highPriorityTasks} tarefas`);
  console.log(`⏱️  Tempo Total: ${summary.totalEstimatedHours} horas`);
  console.log('━'.repeat(80));
  
  console.log('\n📋 Projetos:\n');
  
  projectStats.forEach((proj, idx) => {
    const statusIcon = proj.overdue > 0 ? '🔴' : proj.urgent > 5 ? '🟡' : '🟢';
    console.log(`${statusIcon} ${(idx + 1)}. ${proj.name}`);
    console.log(`   ├─ Total: ${proj.total} tarefas`);
    console.log(`   ├─ Urgentes: ${proj.urgent} tarefas`);
    if (proj.overdue > 0) {
      console.log(`   ├─ ⚠️  ATRASADAS: ${proj.overdue} tarefas`);
    }
    console.log(`   ├─ Alta Prioridade: ${proj.highPriority} tarefas`);
    console.log(`   └─ Tempo Estimado: ${proj.totalHours}h\n`);
  });
  
  console.log('━'.repeat(80));
}

// Mostrar tarefas urgentes de hoje/amanhã
function displayUrgentTasks() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  console.log('\n🚨 TAREFAS CRÍTICAS (Próximos 7 dias)\n');
  console.log('━'.repeat(80));
  
  let count = 0;
  hubspotData.projects.forEach(project => {
    const urgentTasks = project.tasks
      .filter(t => {
        const deadline = new Date(t.deadline);
        return deadline <= nextWeek && deadline >= now;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    if (urgentTasks.length > 0) {
      console.log(`\n📁 ${project.goal.name} (${urgentTasks.length} tarefas)\n`);
      
      urgentTasks.forEach(task => {
        count++;
        const deadline = new Date(task.deadline);
        const timeStr = deadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const priorityIcon = task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢';
        const durationStr = `${task.duration}min`;
        
        console.log(`   ${priorityIcon} ${timeStr} | ${durationStr.padEnd(7)} | ${task.title}`);
      });
    }
  });
  
  console.log('\n━'.repeat(80));
  console.log(`Total: ${count} tarefas urgentes\n`);
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const projectFilter = args.find(arg => arg.startsWith('--project='));
  
  if (projectFilter) {
    const projectName = projectFilter.split('=')[1];
    console.log(`\n🎯 Filtrando projeto: ${projectName}\n`);
    // TODO: Implementar filtro de projeto
    displaySummary(); // Fallback para compatibilidade
  } else {
    // Mostrar visão completa
    displayAllProjects();
    displayUrgentTasks();
    
    console.log('\n💡 Próximos Passos:\n');
    console.log('   1. Faça login no sistema GoalFlow');
    console.log('   2. Importe os projetos em ordem de prioridade');
    console.log('   3. Comece pelas tarefas do dia 17/11 (críticas!)');
    console.log('   4. Configure recorrências para trackings diários\n');
    
    console.log('📄 Documentação disponível em:');
    console.log('   • HUBSPOT_TASKS_COMPLETE.md (visão completa)');
    console.log('   • PATAGON_STAR_TASKS.md (detalhes Patagon)');
    console.log('   • hubspot-tasks-import.json (dados estruturados)\n');
  }
}

// Exportar para uso como módulo
module.exports = {
  patagonStarData,
  analyzePatagonTasks,
  exportForFirebase,
  hubspotData,
  analyzeAllProjects,
  displayAllProjects,
  displayUrgentTasks
};

