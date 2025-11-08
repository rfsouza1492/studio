'use server';
/**
 * @fileOverview The AI flow for the GoalFlow conversational agent using the Gemini REST API.
 *
 * - talkToAgent - The main function that processes the user's query.
 */
import * as schemas from '@/lib/schemas';
import { generate } from '@genkit-ai/ai';
import { defineFlow } from '@genkit-ai/flow';
import { gemini15Flash } from '@genkit-ai/googleai';
import z from 'zod';

const systemPrompt = `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
Your response should be a conversational message to the user.`;

// Extrai os tipos inferidos do Zod para garantir a segurança de tipos.
type GoalContext = z.infer<typeof schemas.AgentInputSchema>['context']['goals'][number];
type TaskContext = z.infer<typeof schemas.AgentInputSchema>['context']['tasks'][number];

/**
 * CORREÇÃO FINAL: Implementa a lógica de cálculo de progresso de duas etapas
 * (KPI e tarefas), espelhando a lógica usada nos componentes da UI (GoalCard.tsx).
 * Isso garante que a IA tenha uma visão consistente e precisa do progresso do usuário.
 */
function formatContextForPrompt(
  context: z.infer<typeof schemas.AgentInputSchema>['context']
): string {
  if (!context || (!context.goals?.length && !context.tasks?.length)) {
    return "The user currently has no goals or tasks.";
  }

  let formattedString = '';

  if (context.goals && context.goals.length > 0) {
    formattedString += "User's Current Goals:\n";
    const goalsSummary = context.goals
      .map((goal: GoalContext) => {
        let progress = 0;
        // Lógica de progresso baseada em KPI, espelhando GoalCard.tsx.
        if (goal.kpiTarget && goal.kpiTarget > 0) {
          progress = Math.round(((goal.kpiCurrent ?? 0) / goal.kpiTarget) * 100);
        } else {
          // Fallback para lógica de progresso baseada em tarefas.
          const goalTasks = context.tasks?.filter(t => t.goalId === goal.id) || [];
          if (goalTasks.length > 0) {
            const completedTasks = goalTasks.filter(t => t.completed).length;
            progress = Math.round((completedTasks / goalTasks.length) * 100);
          }
        }
        return `- Goal: \"${goal.name}\" (Progress: ${progress}%)`;
      })
      .join('\n');
    formattedString += goalsSummary;
  }

  if (context.tasks && context.tasks.length > 0) {
    formattedString += "\n\nUser's Current Tasks:\n";
    const tasksSummary = context.tasks
      .map(
        (task: TaskContext) =>
          `- Task: \"${task.title}\" (Status: ${task.completed ? 'Completed' : 'Pending'}, Priority: ${task.priority})`
      )
      .join('\n');
    formattedString += tasksSummary;
  }

  return formattedString.trim();
}

export const talkToAgentFlow = defineFlow(
  {
    name: 'talkToAgentFlow',
    inputSchema: schemas.AgentInputSchema,
    outputSchema: z.string(),
  },
  async ({ query, context }) => {
    const formattedContext = formatContextForPrompt(context);
    const prompt = `User message: \"${query}\"\n\n# USER'S CURRENT CONTEXT\n${formattedContext}`;

    const llmResponse = await generate({
      model: gemini15Flash,
      prompt: prompt,
      system: systemPrompt,
      config: {
        temperature: 0.5,
      },
    });

    return llmResponse.text;
  }
);
