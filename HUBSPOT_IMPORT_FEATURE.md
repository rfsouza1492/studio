# Feature: Importação de Tarefas do HubSpot

## 📋 Visão Geral

Sistema completo de importação de tarefas do HubSpot diretamente pela interface do GoalFlow. Permite importar 52 tarefas organizadas em 6 projetos com apenas alguns cliques.

## ✨ Funcionalidades

### 1. Diálogo de Importação Interativo
- ✅ Visualização de todos os projetos disponíveis
- ✅ Seleção individual ou múltipla de projetos
- ✅ Estatísticas em tempo real (tarefas urgentes, atrasadas, prioridades)
- ✅ Abas para visualização por projetos ou estatísticas gerais
- ✅ Indicadores visuais de status (urgente, atrasado, alta prioridade)

### 2. Botão no Header
- ✅ Acesso rápido pela navegação principal
- ✅ Visível apenas para usuários autenticados
- ✅ Ícone de download para fácil identificação

### 3. Importação Inteligente
- ✅ Cria automaticamente as metas no Firebase
- ✅ Importa todas as tarefas com metadados completos
- ✅ Preserva prioridades, prazos e durações
- ✅ Feedback visual durante importação
- ✅ Toast de confirmação ao finalizar

## 🎯 Dados Importados

### Estrutura de Cada Projeto

```typescript
{
  goal: {
    name: string,          // Nome da meta
    kpiName: string,       // Nome do KPI
    kpiTarget: number,     // Meta do KPI
    kpiCurrent: number     // Progresso atual
  },
  tasks: [{
    title: string,         // Título da tarefa
    priority: "High" | "Medium" | "Low",
    deadline: string,      // Data/hora limite (ISO)
    duration: number,      // Duração em minutos
    recurrence: string,    // Frequência (None, Daily, etc)
    category: string       // Categoria da tarefa
  }]
}
```

### Projetos Disponíveis

1. **Formulário - Melhorias Urgentes** (10 tarefas, 9.5h)
2. **Meta Patagon Star** (11 tarefas, 14.8h)
3. **VExpenses - Bugs e Features** (7 tarefas, 10.5h)
4. **Tracking & Monitoring** (14 tarefas, 7h)
5. **Rotunno - Desenvolvimento** (1 tarefa, 4h)
6. **Análises & Investigações** (7 tarefas, 7.5h)

**Total**: 52 tarefas | 51.8 horas de trabalho

## 🚀 Como Usar

### Passo 1: Abrir o Diálogo
1. Faça login no GoalFlow
2. Clique no botão **"Importar HubSpot"** no header
3. Aguarde o diálogo abrir

### Passo 2: Selecionar Projetos
1. Navegue pela aba **"Projetos"** para ver todos disponíveis
2. Clique nos cards para selecionar/desselecionar
3. Use **"Selecionar Todos"** para marcar todos de uma vez
4. Veja as estatísticas na aba **"Estatísticas"**

### Passo 3: Importar
1. Clique em **"Importar (X)"** onde X = número de projetos selecionados
2. Aguarde a importação (mostra loader animado)
3. Veja o resumo de conclusão com total de tarefas importadas

### Passo 4: Verificar
1. Volte para a página de **Metas**
2. Veja as novas metas criadas
3. Expanda cada meta para ver as tarefas

## 📊 Indicadores Visuais

### No Card de Projeto
- 🔴 **Badge "X atrasadas"** - Tarefas com prazo vencido
- 🟠 **"X urgentes"** - Tarefas nos próximos 7 dias
- 🔴 **"X alta prioridade"** - Tarefas críticas
- ⏱️ **"Xh"** - Tempo total estimado

### Badges de Prioridade
- 🔴 **High** - Vermelho (destructive)
- 🟡 **Medium** - Amarelo (default)
- 🟢 **Low** - Verde (secondary)

## 🔧 Implementação Técnica

### Arquivos Criados/Modificados

```
studio/
├── src/
│   └── components/
│       ├── dialogs/
│       │   └── ImportHubSpotTasksDialog.tsx    [NOVO]
│       └── layout/
│           └── Header.tsx                      [MODIFICADO]
├── hubspot-tasks-import.json                   [FONTE DE DADOS]
└── HUBSPOT_IMPORT_FEATURE.md                   [ESTE ARQUIVO]
```

### Dependências
- `@/context/GoalContext` - Para criar metas e tarefas
- `@/hooks/use-toast` - Para notificações
- `@/components/ui/*` - Componentes de UI (shadcn)
- `hubspot-tasks-import.json` - Dados estáticos

### Hook Principal: `useGoals()`

```typescript
const { addGoal, addTask } = useGoals();

// Criar meta
const goalId = await addGoal(name, kpiName, kpiTarget, kpiCurrent);

// Adicionar tarefa
await addTask(goalId, title, priority, recurrence, deadline, duration);
```

## 🎨 UX/UI Features

### Responsividade
- ✅ Modal adaptável (max-width: 800px)
- ✅ Altura máxima com scroll (90vh)
- ✅ Grid responsivo de estatísticas
- ✅ Botão oculto em mobile (hidden sm:flex)

### Acessibilidade
- ✅ Checkboxes clicáveis
- ✅ Cards totalmente clicáveis
- ✅ Feedback visual em todos os estados
- ✅ Loading states com animações

### Estados da Interface

1. **Estado Inicial**
   - Todos os projetos visíveis
   - Nenhum selecionado
   - Botão "Importar" desabilitado

2. **Estado de Seleção**
   - Projetos selecionados com borda azul
   - Contador atualizado
   - Botão "Importar" mostra quantidade

3. **Estado de Importação**
   - Loading spinner no botão
   - Botões desabilitados
   - Texto "Importando..."

4. **Estado de Conclusão**
   - Tela de sucesso com checkmark
   - Contador de tarefas importadas
   - Botão "Fechar"

## 📈 Estatísticas Calculadas

### Por Projeto
- **Urgentes**: Tarefas com prazo ≤ 7 dias
- **Atrasadas**: Tarefas com prazo < hoje
- **Alta Prioridade**: Tarefas com priority="High"
- **Tempo Total**: Soma de todas as durações (em horas)

### Globais (Summary)
```json
{
  "totalTasks": 52,
  "totalProjects": 6,
  "urgentTasks": 33,
  "highPriorityTasks": 25,
  "totalEstimatedHours": 51.8
}
```

## 🔄 Fluxo de Importação

```mermaid
graph TD
    A[Usuário clica "Importar HubSpot"] --> B[Abre Diálogo]
    B --> C{Seleciona Projetos}
    C --> D[Clica "Importar"]
    D --> E[Loop: Para cada projeto selecionado]
    E --> F[Criar Meta no Firebase]
    F --> G[Loop: Para cada tarefa]
    G --> H[Adicionar Tarefa à Meta]
    H --> I{Mais tarefas?}
    I -->|Sim| G
    I -->|Não| J{Mais projetos?}
    J -->|Sim| E
    J -->|Não| K[Mostrar Tela de Sucesso]
    K --> L[Toast de Confirmação]
```

## ⚠️ Considerações Importantes

### Performance
- **Delay entre projetos**: 100ms para não sobrecarregar Firebase
- **Batch operations**: Tarefas são adicionadas sequencialmente
- **Loading states**: Feedback visual durante todo processo

### Segurança
- **Usuário autenticado**: Botão desabilitado se não logado
- **Validação**: Verifica se projetos foram selecionados
- **Error handling**: Try/catch com toast de erro

### UX
- **Feedback imediato**: Loading em tempo real
- **Estado persistente**: Seleção mantida durante navegação nas abas
- **Reset automático**: Estado limpo ao fechar/reabrir diálogo

## 🐛 Tratamento de Erros

```typescript
try {
  // Importação
} catch (error) {
  console.error('Erro ao importar tarefas:', error);
  toast({
    variant: "destructive",
    title: "Erro na Importação",
    description: error.message || "Não foi possível importar as tarefas.",
  });
}
```

## 🎯 Casos de Uso

### Caso 1: Importação Completa
**Cenário**: Usuário quer importar todos os projetos

1. Clicar "Importar HubSpot"
2. Clicar "Selecionar Todos"
3. Clicar "Importar (6)"
4. Aguardar ~30 segundos
5. Ver confirmação: "52 tarefas importadas"

**Resultado**: 6 novas metas + 52 tarefas no GoalFlow

### Caso 2: Importação Seletiva
**Cenário**: Usuário quer apenas tarefas urgentes

1. Clicar "Importar HubSpot"
2. Selecionar apenas "Formulário" e "Patagon Star"
3. Clicar "Importar (2)"
4. Aguardar ~10 segundos
5. Ver confirmação: "21 tarefas importadas"

**Resultado**: 2 novas metas + 21 tarefas no GoalFlow

### Caso 3: Revisão de Estatísticas
**Cenário**: Usuário quer ver overview antes de importar

1. Clicar "Importar HubSpot"
2. Ir para aba "Estatísticas"
3. Revisar números globais
4. Ver detalhes por projeto
5. Voltar para "Projetos" e selecionar

**Resultado**: Decisão informada sobre o que importar

## 📝 Melhorias Futuras

### Fase 2
- [ ] Importação incremental (atualizar existentes)
- [ ] Sincronização automática com HubSpot API
- [ ] Filtros por categoria/prioridade
- [ ] Preview de tarefas antes da importação
- [ ] Edição em massa antes de importar

### Fase 3
- [ ] Exportação de tarefas do GoalFlow para HubSpot
- [ ] Webhook para sincronização bidirecional
- [ ] Dashboard de analytics de importação
- [ ] Histórico de importações
- [ ] Rollback de importações

## 🔗 Links Relacionados

- [HUBSPOT_TASKS_COMPLETE.md](./HUBSPOT_TASKS_COMPLETE.md) - Documentação completa das tarefas
- [PATAGON_STAR_TASKS.md](./PATAGON_STAR_TASKS.md) - Detalhes do projeto Patagon
- [hubspot-tasks-import.json](./hubspot-tasks-import.json) - Dados fonte
- [scripts/import-patagon-tasks.js](./scripts/import-patagon-tasks.js) - Script CLI

---

**Status**: ✅ Implementado e Testado  
**Versão**: 1.0.0  
**Data**: 11 de novembro de 2025  
**Autor**: GoalFlow Team

