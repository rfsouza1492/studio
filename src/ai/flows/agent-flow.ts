'use server';
/**
 * @fileOverview O fluxo de IA para o agente de conversação GoalFlow.
 *
 * - talkToAgent - A função principal que processa a consulta do usuário.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { AgentInput, AgentOutput } from '@/app/types';
import { z } from 'zod';

const AgentInputSchema = z.object({
  query: z.string(),
  context: z.object({
    goals: z.array(z.any()),
    tasks: z.array(z.any()),
  }),
});

const AgentOutputSchema = z.object({
  message: z.string().describe('Your conversational response here.'),
});

const agentPrompt = ai.definePrompt(
  {
    name: 'goalFlowAgentPrompt',
    input: { schema: AgentInputSchema },
    output: { schema: AgentOutputSchema },
    model: googleAI.model('gemini-pro'),
    system: `You are Flow, a helpful and friendly productivity assistant for the GoalFlow app.
You are having a conversation with a user about their goals and tasks.
You MUST respond with a valid JSON object that adheres to the AgentOutput schema and nothing else.
Your entire response must be a single JSON object.
Do not include any markdown formatting (like \`\`\`json), commentary, or any other characters outside of the JSON object.

Here is the user's current context (their goals and tasks):
{{{jsonStringify context}}}

User message: "{{query}}"`,
  },
  async (input) => {
    return {
      context: JSON.stringify(input.context, null, 2),
      query: input.query,
    };
  }
);

export async function talkToAgent(
  input: AgentInput
): Promise<AgentOutput> {
  try {
    const { output } = await agentPrompt(input);

    if (!output) {
        throw new Error('AI response is empty or invalid.');
    }
    
    // A saída já deve ser um objeto JSON validado pelo Zod
    return output;

  } catch (error) {
    console.error('Erro em talkToAgent:', error);
    // Retorna um erro estruturado se algo der errado
    return {
      message: `Desculpe, tive um problema para processar sua solicitação. O serviço de IA pode não estar configurado corretamente.`,
    };
  }
}
