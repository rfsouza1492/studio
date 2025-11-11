# Meta Patagon Star - Tarefas

> **Status**: 11 tarefas pendentes  
> **Última atualização**: 11 de novembro de 2025  
> **Fonte**: HubSpot Core Report

## 📊 Visão Geral

Esta meta contém tarefas relacionadas ao projeto VExpenses e melhorias na plataforma Patagon, incluindo ajustes de IA, integrações com CRM e melhorias de UX.

## 🎯 Tarefas por Prioridade

### 🔴 Alta Prioridade (Prazo Próximo)

#### 1. VExpenses: Apresentar proposta de critérios para leads premium
- **Prazo**: 28 de novembro de 2025, 21:00
- **Categoria**: Produto/Estratégia
- **Duração Estimada**: 120 minutos
- **Descrição**: Definir e apresentar critérios claros para classificação de leads premium no sistema VExpenses
- **Entregável**: Documento de proposta com critérios mensuráveis

#### 2. VExpenses: Implementar ajustes no prompt baseados no feedback da Alana
- **Prazo**: 21 de novembro de 2025, 21:00
- **Categoria**: IA/Prompt Engineering
- **Duração Estimada**: 90 minutos
- **Descrição**: Revisar e aplicar melhorias no prompt da IA com base no feedback recebido
- **Dependências**: Feedback da Alana documentado

#### 3. VExpenses: Desenvolver dashboard com dados cruzados WhatsApp + Pipedrive
- **Prazo**: 21 de novembro de 2025, 21:00
- **Categoria**: Desenvolvimento/Integração
- **Duração Estimada**: 240 minutos
- **Descrição**: Criar dashboard integrado que cruza dados de conversas do WhatsApp com pipeline do Pipedrive
- **Stack**: React/TypeScript, API WhatsApp, API Pipedrive
- **Entregável**: Dashboard funcional com métricas principais

### 🟡 Média Prioridade (Prazo Urgente - 17 de novembro)

#### 4. Implementar orientação para clientes quando conteúdo for PDF ou imagem
- **Prazo**: 17 de novembro de 2025, 15:28
- **Categoria**: UX/Frontend
- **Duração Estimada**: 60 minutos
- **Descrição**: Adicionar tooltips ou mensagens informativas quando usuário carregar PDF ou imagem
- **Localização**: Componente de upload de arquivos

#### 5. Retornar sobre melhoria na clareza dos detalhes da nova interface de attribution
- **Prazo**: 17 de novembro de 2025, 15:28
- **Categoria**: UX/Design
- **Duração Estimada**: 45 minutos
- **Descrição**: Revisar e melhorar clareza visual dos detalhes na interface de atribuição
- **Ação**: Revisar com time de produto

#### 6. Melhorar mensagem de erro da API quando email já existe mas CNPJ não está cadastrado
- **Prazo**: 17 de novembro de 2025, 15:28
- **Categoria**: Backend/API
- **Duração Estimada**: 30 minutos
- **Descrição**: Tornar mensagem de erro mais específica e acionável para o usuário
- **Localização**: Endpoint de cadastro/registro

#### 7. Atualizar settings para Salesforce
- **Prazo**: 17 de novembro de 2025, 15:05
- **Categoria**: Integração/Config
- **Duração Estimada**: 45 minutos
- **Descrição**: Atualizar configurações de integração com Salesforce
- **Documentação**: Verificar documentação atual da API Salesforce

#### 8. Investigar e corrigir inconsistências nos dados do dashboard da Patagon
- **Prazo**: 17 de novembro de 2025, 14:43
- **Categoria**: Bug/Investigação
- **Duração Estimada**: 120 minutos
- **Descrição**: Identificar causa raiz das inconsistências nos dados exibidos
- **Prioridade**: Alta, impacta análise de dados
- **Checklist**:
  - [ ] Identificar quais métricas estão inconsistentes
  - [ ] Verificar queries de banco de dados
  - [ ] Validar pipeline de dados
  - [ ] Implementar correção
  - [ ] Adicionar testes de validação

#### 9. Corrigir prompt da IA: Regras de qualificação e desqualificação de leads
- **Prazo**: 17 de novembro de 2025, 14:17
- **Categoria**: IA/Prompt Engineering
- **Duração Estimada**: 90 minutos
- **Descrição**: Ajustar prompt para melhorar precisão na qualificação automática de leads
- **Impacto**: Qualidade do lead scoring

#### 10. Solicitar correção de cadastro - Endereço incorreto na base do prestador Patagon
- **Prazo**: 17 de novembro de 2025, 14:12
- **Categoria**: Administrativo/Dados
- **Duração Estimada**: 15 minutos
- **Descrição**: Abrir ticket para correção de dados cadastrais
- **Responsável**: Time de suporte

#### 11. Adicionar informação sobre crediário no follow-up de agendamento
- **Prazo**: 17 de novembro de 2025, 13:54
- **Categoria**: Comunicação/Template
- **Duração Estimada**: 30 minutos
- **Descrição**: Incluir informações sobre opções de crediário no template de follow-up
- **Localização**: Templates de email/mensagem

## 📈 Distribuição por Categoria

- **IA/Prompt Engineering**: 2 tarefas
- **Desenvolvimento/Integração**: 1 tarefa
- **UX/Frontend**: 2 tarefas
- **Backend/API**: 1 tarefa
- **Bug/Investigação**: 1 tarefa
- **Produto/Estratégia**: 1 tarefa
- **Integração/Config**: 1 tarefa
- **Administrativo**: 1 tarefa
- **Comunicação**: 1 tarefa

## 🚀 Roadmap Sugerido

### Semana de 11-17 de novembro (URGENTE)
Completar todas as tarefas com prazo 17/11:
1. Investigar inconsistências dashboard (prioridade máxima)
2. Corrigir prompt de qualificação de leads
3. Melhorar mensagem de erro da API
4. Implementar orientação para PDFs/imagens
5. Atualizar settings Salesforce
6. Tarefas administrativas e de comunicação

### Semana de 18-21 de novembro
1. Desenvolver dashboard WhatsApp + Pipedrive (tarefa mais complexa)
2. Implementar ajustes no prompt (feedback Alana)

### Semana de 22-28 de novembro
1. Apresentar proposta de critérios para leads premium

## 💡 Notas de Implementação

### Para Importar no Sistema GoalFlow

Você pode usar o formato JSON abaixo para importar estas tarefas diretamente:

```json
{
  "goal": {
    "name": "Meta Patagon Star",
    "kpiName": "Tarefas Completadas",
    "kpiTarget": 11,
    "kpiCurrent": 0
  },
  "tasks": [
    {
      "title": "VExpenses: Apresentar proposta de critérios para leads premium",
      "priority": "High",
      "deadline": "2025-11-28T21:00:00",
      "duration": 120,
      "recurrence": "None"
    },
    {
      "title": "VExpenses: Implementar ajustes no prompt baseados no feedback da Alana",
      "priority": "High",
      "deadline": "2025-11-21T21:00:00",
      "duration": 90,
      "recurrence": "None"
    },
    {
      "title": "VExpenses: Desenvolver dashboard com dados cruzados WhatsApp + Pipedrive",
      "priority": "High",
      "deadline": "2025-11-21T21:00:00",
      "duration": 240,
      "recurrence": "None"
    },
    {
      "title": "Implementar orientação para clientes quando conteúdo for PDF ou imagem",
      "priority": "Medium",
      "deadline": "2025-11-17T15:28:00",
      "duration": 60,
      "recurrence": "None"
    },
    {
      "title": "Retornar sobre melhoria na clareza dos detalhes da nova interface de attribution",
      "priority": "Medium",
      "deadline": "2025-11-17T15:28:00",
      "duration": 45,
      "recurrence": "None"
    },
    {
      "title": "Melhorar mensagem de erro da API quando email já existe mas CNPJ não está cadastrado",
      "priority": "Medium",
      "deadline": "2025-11-17T15:28:00",
      "duration": 30,
      "recurrence": "None"
    },
    {
      "title": "Atualizar settings para Salesforce",
      "priority": "Medium",
      "deadline": "2025-11-17T15:05:00",
      "duration": 45,
      "recurrence": "None"
    },
    {
      "title": "Investigar e corrigir inconsistências nos dados do dashboard da Patagon",
      "priority": "High",
      "deadline": "2025-11-17T14:43:00",
      "duration": 120,
      "recurrence": "None"
    },
    {
      "title": "Corrigir prompt da IA: Regras de qualificação e desqualificação de leads",
      "priority": "High",
      "deadline": "2025-11-17T14:17:00",
      "duration": 90,
      "recurrence": "None"
    },
    {
      "title": "Solicitar correção de cadastro - Endereço incorreto na base do prestador Patagon",
      "priority": "Low",
      "deadline": "2025-11-17T14:12:00",
      "duration": 15,
      "recurrence": "None"
    },
    {
      "title": "Adicionar informação sobre crediário no follow-up de agendamento",
      "priority": "Medium",
      "deadline": "2025-11-17T13:54:00",
      "duration": 30,
      "recurrence": "None"
    }
  ]
}
```

### Scripts Úteis

Para criar rapidamente essas tarefas via Firebase, você pode usar o contexto GoalContext existente.

## ⚠️ Alertas

- **6 tarefas com prazo em 17/11** - ATENÇÃO URGENTE!
- Total estimado para tarefas urgentes: ~6 horas de trabalho
- Tarefa mais complexa: Dashboard WhatsApp + Pipedrive (4 horas)

## ✅ Checklist de Execução

- [ ] Revisar todas as tarefas e confirmar prioridades
- [ ] Criar meta "Patagon Star" no GoalFlow
- [ ] Importar todas as tarefas
- [ ] Alocar tempo no calendário para tarefas urgentes
- [ ] Coordenar com Alana sobre feedback do prompt
- [ ] Definir responsáveis para cada tarefa
- [ ] Setup de tracking de progresso

---

**Próximos Passos**: 
1. Importar estas tarefas no sistema GoalFlow
2. Agendar sessão de planejamento para tarefas urgentes
3. Identificar possíveis bloqueadores

