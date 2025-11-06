'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AgentInputSchema, AgentOutputSchema, GoalSuggestionSchema } from '@/app/types';
import type { AgentInput, AgentOutput } from '@/app/types';


// Helper function to format the complex context object into a simple string.
function getGoalCoachPrompt(context: AgentInput['context']): string {
  return `Você é o Flow, um coach especialista em definição de metas e produtividade.

CONTEXTO DO USUÁRIO:
- Metas atuais: ${context.goals.length}
- Tarefas pendentes: ${context.tasks.filter((t: any) => !t.completed).length}

SEU PAPEL:
1. Fazer perguntas estratégicas para entender os objetivos do usuário
2. Sugerir metas SMART com KPIs mensuráveis
3. Quebrar metas em tarefas acionáveis (com prioridade, duração estimada)
4. Dar feedback construtivo e motivador

FLUXO DE CONVERSA:
- Se o usuário está começando: pergunte sobre áreas de interesse (carreira, saúde, educação, etc.)
- Se já tem uma meta em mente: refine-a usando SMART e sugira tarefas
- Se pedir ajuda genérica: ofereça exemplos práticos

FORMATO DE RESPOSTA (JSON):
{
  "message": "Sua resposta conversacional",
  "suggestions": [
    {
      "goalName": "Nome da meta SMART",
      "kpiName": "Métrica mensurável (opcional)",
      "tasks": [
        {
          "title": "Tarefa específica",
          "priority": "High" | "Medium" | "Low",
          "duration": 60,
          "recurrence": "Daily" | "Weekly" | "None"
        }
      ]
    }
  ],
  "action": "create_goals" | "clarify" | "answer"
}

- Use "create_goals" quando tiver sugestões concretas
- Use "clarify" quando precisar de mais informações
- Use "answer" para perguntas gerais

REGRAS:
- Seja conciso e prático
- Tarefas devem ter duração entre 15-180 minutos
- Use prioridade "High" apenas para urgente E importante
- Sugira no máximo 3 metas por vez
- Cada meta deve ter 3-7 tarefas iniciais`;
}

function getChatPrompt(context: AgentInput['context']): string {
  return `Você é o Flow, assistente de produtividade do usuário.

CONTEXTO:
${JSON.stringify(context, null, 2)}

Responda perguntas sobre metas, tarefas e produtividade de forma amigável.
Formate a resposta como JSON: { "message": "sua resposta", "action": "answer" }`;
}

// Wrapper function that will be called by the front-end
export async function talkToAgent(input: AgentInput): Promise<AgentOutput> {
  // Directly call the flow, ensuring the input matches the schema.
  return agentFlow(input);
}

// Define the main AI flow
const agentFlow = ai.defineFlow(
  {
    name: 'agentFlow',
    inputSchema: AgentInputSchema,
    outputSchema: AgentOutputSchema,
  },
  async ({ query, context, mode }) => {
    const systemPrompt = mode === 'goal_coach' 
      ? getGoalCoachPrompt(context)
      : getChatPrompt(context);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `${systemPrompt}

Mensagem do usuário: ${query}`,
      output: { 
          format: 'json',
          schema: AgentOutputSchema,
      },
    });

    if (!output) {
      return {
        message: 'Desculpe, não consegui processar sua solicitação.',
        action: 'answer'
      }
    }

    return output;
  }
);
